import { Box } from '$lib/layout/margins/Box';
import { PlotMargins } from '$lib/layout/margins/PlotMargins.svelte';
import { resolveAccessor } from '$lib/utils/accessors';
import { SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { ValueLabels } from '$lib/layout/styles/ValueLabels';
import type { PlotAxes } from '$lib/phases/data/PlotAxes';
import type { AxisChannelName } from '$lib/types/layout/mapping';
import type { ProcessedChannel, ProcessedData, ProcessedRow } from '$lib/types/phases';
import type { TooltipAnchorX, TooltipAnchorY } from '$lib/types/layout/tooltip';
import type { Series } from '$lib/types/plots/data/common';

/** A tooltip anchor as the side of the point the tooltip sits on. */
const SIDES = {
	left: 'before',
	top: 'before',
	middle: 'middle',
	right: 'after',
	bottom: 'after'
} as const;

const STACKS: Record<AxisChannelName, string> = { x: 'stackX', y: 'stackY' };

/** What a tooltip is shown from, each read reactively. */
export type TooltipInputs = {
	/** The point it sits beside. */
	point: () => { x: number; y: number };
	/** The side of the point it prefers, per axis. */
	anchor: () => { x: TooltipAnchorX; y: TooltipAnchorY };
	/** The box it must stay within. Unset, its plot's. */
	bounds: () => { width: number; height: number } | undefined;
};

/**
 * One tooltip: how big it rendered (`width`, `height`, bound to its element),
 * where that puts it (`box`) - beside its point on its preferred side, moving
 * over where it would leave its plot's box, as the plot's {@link PlotMargins}
 * places it - and how its rows read. Its statics are the text a plot's
 * default tooltip reads. Create it during component init.
 */
export class TooltipState {
	width = $state(0);
	height = $state(0);
	readonly #inputs: TooltipInputs;
	readonly #plotMargins = PlotMargins.current();

	constructor(inputs: TooltipInputs) {
		this.#inputs = inputs;
	}

	/** Where the tooltip sits. */
	readonly box = $derived.by((): Box => {
		const size = Box.size(this.width, this.height);
		const { x, y } = this.#inputs.anchor();
		const anchor = { x: SIDES[x], y: SIDES[y] };
		const point = this.#inputs.point();
		const bounds = this.#inputs.bounds();
		if (bounds) return size.placeNear(point, anchor, Box.size(bounds.width, bounds.height));
		return (
			this.#plotMargins?.place(size, point, anchor) ??
			size.placeNear(point, anchor, Box.size(Infinity, Infinity))
		);
	});

	/** The text `rows` read as through `format`, one line each, in `sort`'s order when given. */
	static text<TRow>(
		rows: TRow[],
		format: (row: TRow) => string,
		sort?: (a: TRow, b: TRow) => number
	): string {
		return (sort ? [...rows].sort(sort) : rows).map(format).join('\n');
	}

	/**
	 * Orders rows from the highest value `valueOf` reads to the lowest. A row
	 * without a numeric value goes after every one with, and rows that tie keep
	 * the order the hover matched them in.
	 */
	static descending<TRow>(valueOf: (row: TRow) => unknown): (a: TRow, b: TRow) => number {
		const numberOf = (row: TRow) => {
			const value = valueOf(row);
			return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
		};
		return (a, b) => {
			const left = numberOf(a);
			const right = numberOf(b);
			if (left === undefined || right === undefined) {
				return (left === undefined ? 1 : 0) - (right === undefined ? 1 : 0);
			}
			return right - left;
		};
	}

	/** A value as plain text: a date as a locale date, anything else as itself. */
	static value(value: unknown): string {
		return value instanceof Date ? value.toLocaleDateString() : String(value);
	}

	/**
	 * How a hovered row reads by default, on every plot: its series, when the
	 * plot groups its rows; then where it sits - `category: value` when one
	 * axis is a band of categories (the row's own value, as its series reads
	 * it), else `x: y` as the transforms left them; then the value its color
	 * shows, when that is a number (a heatmap's cells).
	 */
	static default(state: {
		processedData?: ProcessedData;
		resolvedSeries?: Series<Record<string, unknown>>[];
		channels?: {
			grouping?: unknown;
			color?: { accessor: (row: never) => unknown; source?: unknown };
		};
		axes?: PlotAxes;
	}): (row: ProcessedRow) => string {
		const processed = state.processedData;
		if (!processed) return () => '';
		const x = TooltipState.#axisText(processed, 'x');
		const y = TooltipState.#axisText(processed, 'y');
		const bandX = state.axes?.bands.includes('x') ?? false;
		const bandY = state.axes?.bands.includes('y') ?? false;
		const valueOf = ValueLabels.valueOf(state);
		const position: (row: ProcessedRow) => string =
			bandX && !bandY
				? (row) => `${x(row)}: ${TooltipState.value(valueOf(row))}`
				: bandY && !bandX
					? (row) => `${y(row)}: ${TooltipState.value(valueOf(row))}`
					: (row) => `${x(row)}: ${y(row)}`;
		const grouped = state.channels?.grouping !== undefined;
		const color = state.channels?.color;
		const colorName = typeof color?.source === 'string' ? color.source : 'color';
		return (row) => {
			const lines = grouped ? [String(row[SERIES_KEY])] : [];
			lines.push(position(row));
			const shown = color?.accessor(row as never);
			if (typeof shown === 'number' && Number.isFinite(shown)) {
				lines.push(`${colorName}: ${TooltipState.value(shown)}`);
			}
			return lines.join('\n');
		};
	}

	/**
	 * How one axis reads on a processed row: its own channel, else the range
	 * the transforms gave it - a stack's own share (`2 - 1`), any other span as `1-2`.
	 */
	static #axisText(processed: ProcessedData, axis: AxisChannelName): (row: ProcessedRow) => string {
		const { channels, transforms } = processed;
		const read = (channel: ProcessedChannel) =>
			resolveAccessor(channel as never) as (row: ProcessedRow) => unknown;
		const point = channels[axis];
		if (point !== undefined) {
			const value = read(point);
			return (row) => TooltipState.value(value(row));
		}
		const low = channels[`${axis}1`];
		const high = channels[`${axis}2`];
		if (low === undefined || high === undefined) return () => '';
		const from = read(low);
		const to = read(high);
		if (transforms.some((t) => t.type === STACKS[axis])) {
			return (row) => TooltipState.value(Number(to(row)) - Number(from(row)));
		}
		return (row) => `${TooltipState.value(from(row))}-${TooltipState.value(to(row))}`;
	}
}
