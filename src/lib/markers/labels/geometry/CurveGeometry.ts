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
		plot: {
			scales: BoxScales;
			gap: number;
			dotRadius?: number;
			/** How wide a text is written, in pixels: a label centred near an end of its line is moved in to fit. */
			measure?: (text: string) => number;
		}
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
				// From its bottom, clockwise: up its left, over its top - the side text reads upright on - and down its
				// right, so a text centred on the top has half the circle free on either side.
				const d = `M${cx},${cy + r}A${r},${r} 0 1 1 ${cx},${cy - r}A${r},${r} 0 1 1 ${cx},${cy + r}`;
				return [
					{
						d,
						text: textOf(row),
						row,
						...CurveGeometry.#along(label.offset, 0.5, 0.25),
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
		// Text along a straight stretch's corners spreads its letters apart: a linear line is read along a smooth one
		// through the same points, which never overshoots them.
		const curve = !marker.curve || marker.curve === 'linear' ? 'monotone-x' : marker.curve;
		const path = line().curve(maybeCurve(curve, marker.tension ?? 0) as never);
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
			const offset =
				label.offset === 'max' || label.offset === 'min'
					? CurveGeometry.#extreme(points, label.offset, marker.isHorizontal)
					: label.offset;
			const text = textOf(members[0]);
			const along = CurveGeometry.#along(offset, 1);
			return [
				{
					d,
					text,
					row: members[0],
					...along,
					...CurveGeometry.#inside(along, plot.measure?.(text), CurveGeometry.#length(points)),
					...CurveGeometry.#across(label.side ?? 'above', gap),
					fill: colorOf(members[0])
				}
			];
		});
	}

	/** A centred text moved in along its line just enough to fit whole on it: what falls past an end is not drawn. */
	static #inside(
		along: Pick<CurvedLabel, 'startOffset' | 'textAnchor'>,
		width: number | undefined,
		length: number
	): Partial<Pick<CurvedLabel, 'startOffset'>> {
		if (!width || along.textAnchor !== 'middle' || length <= 0) return {};
		const half = Math.min(50, (width / 2 / length) * 100);
		const at = Number.parseFloat(along.startOffset);
		const fitted = Math.min(Math.max(at, half), 100 - half);
		return fitted === at ? {} : { startOffset: `${Number(fitted.toFixed(3))}%` };
	}

	/** The length of the line through `points`, in pixels. */
	static #length(points: Point[]): number {
		let total = 0;
		for (let i = 1; i < points.length; i++) {
			total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
		}
		return total;
	}

	/**
	 * How far along `points` - as a share of their length - the one with the highest (`'max'`) or lowest value is:
	 * the one highest up the page, or furthest right on a horizontal area.
	 */
	static #extreme(points: Point[], which: 'max' | 'min', isHorizontal?: boolean): `${number}%` {
		const valueOf = ([px, py]: Point) => (isHorizontal ? px : -py);
		let at = 0;
		points.forEach((point, i) => {
			const better =
				which === 'max'
					? valueOf(point) > valueOf(points[at])
					: valueOf(point) < valueOf(points[at]);
			if (better) at = i;
		});
		let total = 0;
		let upTo = 0;
		for (let i = 1; i < points.length; i++) {
			total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
			if (i === at) upTo = total;
		}
		return `${total > 0 ? (upTo / total) * 100 : 50}%`;
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

	/**
	 * Where along the curve, as `startOffset` and `text-anchor`: `offset` runs over the stretch of it that starts at
	 * `from` and spans `extent` - a rim's upper half, from its left side to its right.
	 */
	static #along(
		offset: PathLabelConfig['offset'] = 'middle',
		extent: number,
		from = 0
	): Pick<CurvedLabel, 'startOffset' | 'textAnchor'> {
		const share = (fraction: number) => `${Number(((from + fraction * extent) * 100).toFixed(3))}%`;
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
