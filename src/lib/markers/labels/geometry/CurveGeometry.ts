import { line } from 'd3-shape';
import { DotRadius } from '$lib/markers/dot/DotRadius';
import { maybeCurve } from 'svelteplot/helpers/curves.js';
import type { BoxScales } from '$lib/types/markers/labels/box';
import type { CurveName } from '$lib/types/layout/styles/curve';
import type { CurvedLabel, PathLabelConfig, PathShape } from '$lib/types/markers/labels/path';

type Point = [number, number];

type CurvedMarker = {
	data?: unknown[];
	x?: unknown;
	y?: unknown;
	x1?: unknown;
	x2?: unknown;
	y1?: unknown;
	y2?: unknown;
	r?: unknown;
	grouping?: unknown;
	color?: unknown;
	curve?: CurveName;
	tension?: number;
	isHorizontal?: boolean;
	styles?: Record<string, unknown>;
};

const read =
	(channel: unknown) =>
	(row: unknown): unknown =>
		typeof channel === 'function'
			? (channel as (row: unknown) => unknown)(row)
			: typeof channel === 'string' || typeof channel === 'symbol'
				? (row as Record<string | symbol, unknown>)?.[channel]
				: channel;

const placed = (value: unknown) =>
	value !== null && value !== undefined && !(typeof value === 'number' && Number.isNaN(value));

/**
 * The curves a marker writes its `'path'` labels along, in pixels: each line (one per `grouping`), the top or
 * bottom edge of each area, or the rim of each dot, as its kind's {@link PathShape} tells it.
 */
export class CurveGeometry {
	static build(
		shape: Exclude<PathShape, 'box'>,
		marker: CurvedMarker,
		label: PathLabelConfig<string, string>,
		plot: { scales: BoxScales; gap: number; dotRadius?: number }
	): CurvedLabel[] {
		const rows = (marker.data ?? []).filter((row) => row !== null && row !== undefined);
		const { scales } = plot;
		const gap = label.gap ?? plot.gap;
		const at = (axis: 'x' | 'y', value: unknown) => {
			const scale = scales[axis];
			if (!scale || !placed(value)) return undefined;
			const band = scale.type === 'band' ? Number(scale.fn.bandwidth()) / 2 : 0;
			const px = Number(scale.fn(value)) + band;
			return Number.isFinite(px) ? px : undefined;
		};
		const textOf = CurveGeometry.#text(label.text);
		const colorOf = CurveGeometry.#color(marker, scales);

		if (shape === 'rim') {
			const side = label.side ?? 'outside';
			const [x, y] = [read(marker.x), read(marker.y)];
			return rows.flatMap((row) => {
				const [cx, cy] = [at('x', x(row)), at('y', y(row))];
				const r = DotRadius.of(marker, row, scales, plot.dotRadius ?? 5);
				if (cx === undefined || cy === undefined) return [];
				// From its left, clockwise: over the top, the side text reads upright on.
				const d = `M${cx - r},${cy}A${r},${r} 0 1 1 ${cx + r},${cy}A${r},${r} 0 1 1 ${cx - r},${cy}`;
				return [
					{
						d,
						text: textOf(row),
						row,
						...CurveGeometry.#along(label.offset, 0.5),
						...CurveGeometry.#across(
							side === 'outside' ? 'above' : side === 'inside' ? 'below' : 'on',
							gap
						),
						fill: colorOf(row)
					}
				];
			});
		}

		const [x, y] = CurveGeometry.#channels(shape, marker, label);
		const groupOf = read(marker.grouping);
		const groups = new Map<unknown, unknown[]>();
		for (const row of rows) {
			const key = marker.grouping === undefined ? undefined : groupOf(row);
			groups.set(key, [...(groups.get(key) ?? []), row]);
		}
		const path = line().curve(maybeCurve(marker.curve, marker.tension ?? 0) as never);
		return [...groups.values()].flatMap((members) => {
			const points = members.flatMap((row): Point[] => {
				const [px, py] = [at('x', x(row)), at('y', y(row))];
				return px === undefined || py === undefined ? [] : [[px, py]];
			});
			if (points.length < 2) return [];
			// Text reads left to right: a line drawn the other way is written along its reverse.
			if (points[0][0] > points[points.length - 1][0]) points.reverse();
			const d = path(points);
			if (!d) return [];
			return [
				{
					d,
					text: textOf(members[0]),
					row: members[0],
					...CurveGeometry.#along(label.offset, 1),
					...CurveGeometry.#across(label.side ?? 'above', gap),
					fill: colorOf(members[0])
				}
			];
		});
	}

	/** The channels the curve runs through: a line's own, or an area's top or bottom edge. */
	static #channels(
		shape: 'stroke' | 'area',
		marker: CurvedMarker,
		label: PathLabelConfig<string, string>
	): [(row: unknown) => unknown, (row: unknown) => unknown] {
		if (shape === 'stroke') return [read(marker.x), read(marker.y)];
		const top = (label.edge ?? 'top') === 'top';
		if (marker.isHorizontal) {
			const edge = top ? (marker.x2 ?? marker.x) : (marker.x1 ?? 0);
			return [read(edge), read(marker.y)];
		}
		const edge = top ? (marker.y2 ?? marker.y) : (marker.y1 ?? 0);
		return [read(marker.x), read(edge)];
	}

	/** Where along the curve, as `startOffset` and `text-anchor`; a rim's `extent` is the upper half of its circle. */
	static #along(
		offset: PathLabelConfig['offset'] = 'middle',
		extent: number
	): Pick<CurvedLabel, 'startOffset' | 'textAnchor'> {
		const share = (fraction: number) => `${Number((fraction * extent * 100).toFixed(3))}%`;
		if (offset === 'start') return { startOffset: share(0), textAnchor: 'start' };
		if (offset === 'end') return { startOffset: share(1), textAnchor: 'end' };
		const percent = offset === 'middle' ? 50 : Number.parseFloat(offset);
		const fraction = Number.isFinite(percent) ? Math.min(Math.max(percent / 100, 0), 1) : 0.5;
		return { startOffset: share(fraction), textAnchor: 'middle' };
	}

	/** Which side of the curve, as the text reads it. */
	static #across(side: string, gap: number): Pick<CurvedLabel, 'dy' | 'baseline'> {
		if (side === 'below') return { dy: gap, baseline: 'hanging' };
		if (side === 'on') return { dy: 0, baseline: 'central' };
		return { dy: -gap, baseline: 'auto' };
	}

	/** A label's text: a function of the row, a field of it, else the text itself. */
	static #text(text: unknown): (row: unknown) => string {
		return (row) => {
			if (typeof text === 'function') return String((text as (row: unknown) => unknown)(row) ?? '');
			if (typeof text === 'string' && row && typeof row === 'object' && text in row) {
				return String((row as Record<string, unknown>)[text] ?? '');
			}
			return text === undefined || text === null ? '' : String(text);
		};
	}

	/** The marker's own color for a row: its `color` channel's, else its stroke or fill when that is one color. */
	static #color(marker: CurvedMarker, scales: BoxScales): (row: unknown) => string | undefined {
		const scale = scales.color;
		if (marker.color !== undefined && scale) {
			const color = read(marker.color);
			return (row) => {
				const value = scale.fn(color(row));
				return typeof value === 'string' ? value : undefined;
			};
		}
		const { stroke, fill, dotFill } = marker.styles ?? {};
		const own = [stroke, fill, dotFill].find((value) => typeof value === 'string') as
			| string
			| undefined;
		return () => own;
	}
}
