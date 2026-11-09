import { Box } from '$lib/layout/margins/Box';
import { PlotMargins } from '$lib/layout/margins/PlotMargins.svelte';
import { resolveAccessor } from '$lib/utils/accessors';
import { SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { RowContext } from '$lib/phases/context/RowContext';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import type { AxisChannelName } from '$lib/types/layout/mapping';
import type { ProcessedChannel, ProcessedData, ProcessedRow } from '$lib/types/phases';
import type { Series } from '$lib/types/plots/data/common';
import type { TooltipAnchorX, TooltipAnchorY } from '$lib/types/layout/tooltip';

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

	/** A value as plain text: a date as a locale date, a number as `number` writes it (when given), anything else as itself. */
	static value(value: unknown, number?: (value: number) => string): string {
		if (value instanceof Date) return value.toLocaleDateString();
		return number && typeof value === 'number' ? number(value) : String(value);
	}

	/**
	 * How a hovered row reads by default, on every plot, from its context (see {@link RowContext}): its series,
	 * when the plot groups its rows; then where it sits - `category: value` when one axis is a band of categories,
	 * else `x: y` (an axis the transforms spread into a span, a bin's, as `from-to`); then the value its color
	 * shows, when that is a number (a heatmap's cells). With `number`, the values - the one on the value axis and
	 * the color's - read as it writes them.
	 */
	static default(
		state: {
			processedData?: ProcessedData;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			resolvedSeries?: Series<any>[];
			channels?: {
				grouping?: unknown;
				color?: { accessor: (row: never) => unknown; source?: unknown };
			};
			axes?: PlotAxes;
		},
		number?: (value: number) => string
	): (row: ProcessedRow) => string {
		const processed = state.processedData;
		if (!processed) return () => '';
		const valueAxis = PlotAxes.valueOf(state);
		const contextOf = RowContext.reader(state);
		const bandX = state.axes?.bands.includes('x') ?? false;
		const bandY = state.axes?.bands.includes('y') ?? false;
		const along = (axis: AxisChannelName) => {
			const span = TooltipState.#spanText(processed, axis, number);
			const measured = axis === valueAxis && !state.axes?.bands.includes(axis);
			return (row: ProcessedRow) =>
				span ? span(row) : TooltipState.value(contextOf(row)[axis], measured ? number : undefined);
		};
		const x = along('x');
		const y = along('y');
		const valueOf = (row: ProcessedRow) => TooltipState.value(contextOf(row).value, number);
		const position: (row: ProcessedRow) => string =
			bandX && !bandY
				? (row) => `${x(row)}: ${valueOf(row)}`
				: bandY && !bandX
					? (row) => `${y(row)}: ${valueOf(row)}`
					: (row) => `${x(row)}: ${y(row)}`;
		const grouped = state.channels?.grouping !== undefined;
		const color = state.channels?.color;
		const colorName = typeof color?.source === 'string' ? color.source : 'color';
		return (row) => {
			const lines = grouped ? [String(row[SERIES_KEY])] : [];
			lines.push(position(row));
			const shown = color?.accessor(row as never);
			if (typeof shown === 'number' && Number.isFinite(shown)) {
				lines.push(`${colorName}: ${TooltipState.value(shown, number)}`);
			}
			return lines.join('\n');
		};
	}

	/**
	 * How an axis the transforms spread into a span reads on a processed row - a bin's edges as `from-to` - or
	 * `undefined` when the axis has a value of its own or is a stack's (whose own value the context gives).
	 */
	static #spanText(
		processed: ProcessedData,
		axis: AxisChannelName,
		number?: (value: number) => string
	): ((row: ProcessedRow) => string) | undefined {
		const { channels, transforms } = processed;
		const low = channels[`${axis}1`];
		const high = channels[`${axis}2`];
		if (channels[axis] !== undefined || low === undefined || high === undefined) return undefined;
		if (transforms.some((t) => t.type === STACKS[axis])) return undefined;
		const read = (channel: ProcessedChannel) =>
			resolveAccessor(channel as never) as (row: ProcessedRow) => unknown;
		const from = read(low);
		const to = read(high);
		return (row) =>
			`${TooltipState.value(from(row), number)}-${TooltipState.value(to(row), number)}`;
	}
}
