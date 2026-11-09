import { NumberFormat } from '$lib/utils/NumberFormat';
import type { BandSlice, HoverDisplayPoint } from '$lib/types/layout/hover';
import type { HoverLayerMarker, HoverMarkerConfig } from '$lib/types/markers/common';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';

type Point = HoverDisplayPoint & { row?: unknown };

/** One marker a hover layer draws, keyed so it keeps its place while the hover moves, and the slice it is moved into. */
export type HoverLayerPart = { key: string; marker: HoverLayerMarker; slice?: BandSlice };

/** Some hovered points: of the whole plot, of one series, or of one segment of it, with the one under the pointer. */
export type HoverPointGroup = { key: string; points: Point[]; active: Point | null };

/**
 * The markers a `hover` marker draws in its `back` and `front` layers, over the hovered points: each with the
 * points as its rows, unless it has `data` of its own, placed at them, and split by the slice of the band a point
 * sits in (a grouped bar's series), to be moved into it - all but a `band`, which takes the slice itself.
 */
export class HoverLayers {
	/** The kinds placed by `x` and `y`, which default to the point's. */
	static readonly #PLACED = new Set(['dot', 'text', 'tick', 'image', 'line', 'trail']);

	/** `points` with their label written as `marker`'s number fields, or its `format`, ask. */
	static labelled<T extends Point>(
		points: readonly T[],
		marker: HoverMarkerConfig,
		cfg: PlotStylesConfig
	): T[] {
		const numberOf = NumberFormat.maybe(NumberFormat.displayOf(marker), cfg);
		const number = numberOf ?? NumberFormat.of(undefined, cfg);
		const { format } = marker;
		if (!format && !numberOf) return [...points];
		return points.map((point) => {
			if (format) return { ...point, label: format(point, number) };
			const value = Number(point.label);
			const written =
				point.label !== undefined && point.label !== '' && Number.isFinite(value)
					? numberOf!(value)
					: point.label;
			return { ...point, label: written ?? '' };
		});
	}

	/**
	 * The markers of `marker`'s `layer` over a group of points. A marker over points that sit in a slice of their
	 * band is one part per slice, which `slice` names, to be moved into it as it is drawn - the move is in pixels,
	 * so it is left to the drawing, which knows the band's width.
	 */
	static parts(
		marker: HoverMarkerConfig,
		layer: 'back' | 'front',
		group: HoverPointGroup,
		cfg: PlotStylesConfig
	): HoverLayerPart[] {
		if (group.points.length === 0) return [];
		return (marker[layer] ?? []).flatMap((nested, i) => {
			const key = `${layer}-${group.key}-${i}`;
			const { points: which, ...own } = nested as HoverLayerMarker & { data?: unknown[] };
			if (own.data) return [{ key, marker: own as HoverLayerMarker }];
			const rows = HoverLayers.#pointsOf(which, group);
			if (rows.length === 0) return [];
			const placed = HoverLayers.#placed(HoverLayers.#inHover(own as HoverLayerMarker, cfg));
			if (own.type === 'band')
				return [{ key, marker: { ...placed, data: rows } as HoverLayerMarker }];
			return HoverLayers.#bySlice(rows).map(({ slice, points }) => ({
				key: `${key}-${slice ? `${slice.start},${slice.end}` : ''}`,
				marker: { ...placed, data: points } as HoverLayerMarker,
				slice
			}));
		});
	}

	/** The points a nested marker draws: all of them, the one under the pointer, or those a function keeps. */
	static #pointsOf(which: HoverLayerMarker['points'], group: HoverPointGroup): Point[] {
		if (which === 'active') return group.active ? [group.active] : [];
		if (typeof which === 'function') return group.points.filter(which);
		return group.points;
	}

	/**
	 * `marker` with what it leaves unset taken from the hover: a `rule` at each point along its axis and a `band`
	 * around it, in its slice; a `text` writes the point's label; each in the configuration's `hover` look (a `rect`
	 * too, in its `area` one), and a `dot` and a `text` in the point's series color.
	 */
	static #inHover(marker: HoverLayerMarker, cfg: PlotStylesConfig): HoverLayerMarker {
		const own = marker as Record<string, unknown> & { styles?: object };
		const color = (point: Point) => point.color ?? 'currentColor';
		switch (marker.type) {
			case 'rule':
				return {
					...marker,
					value: own.value ?? ((point: Point) => point[marker.axis]),
					styles: { ...cfg.hover.rule, ...own.styles }
				} as HoverLayerMarker;
			case 'band':
				return {
					...marker,
					value: own.value ?? ((point: Point) => point[marker.axis]),
					slice: own.slice ?? ((point: Point) => point.areaInset),
					styles: { ...cfg.hover.area, ...own.styles }
				} as HoverLayerMarker;
			case 'rect':
				return { ...marker, styles: { ...cfg.hover.area, ...own.styles } } as HoverLayerMarker;
			case 'dot':
				return {
					...marker,
					styles: { ...cfg.hover.dot, dotFill: color, dotStroke: color, ...own.styles }
				} as HoverLayerMarker;
			case 'text':
				return {
					...marker,
					text: own.text ?? ((point: Point) => point.label),
					styles: { ...cfg.hover.font, fill: color, ...own.styles }
				} as HoverLayerMarker;
			default:
				return marker;
		}
	}

	/** `marker` placed at the points: its own `x` and `y`, else the point's. */
	static #placed(marker: HoverLayerMarker): HoverLayerMarker {
		if (!HoverLayers.#PLACED.has(marker.type)) return marker;
		const own = marker as { x?: unknown; y?: unknown };
		return {
			...marker,
			x: own.x ?? ((point: Point) => point.x),
			y: own.y ?? ((point: Point) => point.y)
		} as HoverLayerMarker;
	}

	/** `points` split by the slice of the band each one sits in, in the order they come. */
	static #bySlice(points: Point[]): { slice: BandSlice | undefined; points: Point[] }[] {
		const groups = new Map<string, { slice: BandSlice | undefined; points: Point[] }>();
		for (const point of points) {
			const slice = point.areaInset;
			const id = slice ? `${slice.start},${slice.end}` : '';
			const group = groups.get(id) ?? groups.set(id, { slice, points: [] }).get(id)!;
			group.points.push(point);
		}
		return [...groups.values()];
	}
}
