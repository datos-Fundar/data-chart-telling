/** Marker kinds that split their rows into separate shapes per `grouping`. */
const GROUPING_KINDS = new Set([
	'area',
	'density',
	'line',
	'hull',
	'trail',
	'delaunayLink',
	'delaunayMesh',
	'voronoi',
	'voronoiMesh'
]);

/** Marker kinds whose per-row `color` resolves through the plot's own color scale. */
const COLOR_KINDS = new Set([
	'area',
	'bar',
	'cell',
	'density',
	'delaunayLink',
	'delaunayMesh',
	'dot',
	'hull',
	'line',
	'rect',
	'tick',
	'trail',
	'voronoi',
	'voronoiMesh',
	'waffle'
]);

/** Kinds that draw only a line, so their flat color is `stroke` alone. */
const LINE_KINDS = new Set(['line', 'regression', 'bollinger', 'delta']);

/** Flat color style keys - when a marker sets one, it keeps that color instead of inheriting one. */
const FLAT_COLOR_KEYS = ['fill', 'stroke', 'dotFill', 'dotStroke'];

/** A style value that paints nothing isn't a color choice, so it doesn't block inheritance. */
const isPaint = (value: unknown) =>
	value !== undefined && value !== 'none' && value !== 'transparent';

type MarkerLike = {
	type: string;
	series?: unknown;
	color?: unknown;
	fill?: unknown;
	styles?: Record<string, unknown>;
	bar?: object;
};

/** How a plot's own grouping and colors reach the markers its author adds. */
export class MarkerGrouping {
	/** Whether a marker sets its own flat color, which then takes precedence over any inherited one. */
	static #hasFlatColor(marker: MarkerLike): boolean {
		return isPaint(marker.fill) || FLAT_COLOR_KEYS.some((key) => isPaint(marker.styles?.[key]));
	}

	/**
	 * Gives a marker one flat color (its `styles`, or a box's `bar.fill`) when it
	 * sets none of its own: a series color, the plot's default series color.
	 * Dots take `dotFill`/`dotStroke`, line-only kinds take `stroke`, text takes
	 * `fill` (a stroke would outline its glyphs), filled kinds take both so their
	 * outline matches their fill.
	 */
	static withSeriesColor<TMarker extends MarkerLike>(
		marker: TMarker,
		color: string | undefined
	): TMarker {
		if (!color || MarkerGrouping.#hasFlatColor(marker) || marker.color !== undefined) return marker;
		if (marker.type === 'box') {
			return { ...marker, bar: { fill: color, ...(marker.bar ?? {}) } };
		}
		const keys =
			marker.type === 'dot'
				? ['dotFill', 'dotStroke']
				: LINE_KINDS.has(marker.type)
					? ['stroke']
					: marker.type === 'text'
						? ['fill']
						: ['fill', 'stroke'];
		const styles: Record<string, unknown> = { ...(marker.styles ?? {}) };
		// A `'none'` the marker sets doesn't block the inherited color, but stays itself.
		for (const key of keys) styles[key] ??= color;
		return { ...marker, styles };
	}

	/**
	 * Gives each author marker the plot's own color rules by default:
	 *
	 * - A grouped plot (`color`/`grouping`) splits its markers the same way. A
	 *   grouping-capable marker draws one shape per group, and a color-capable
	 *   marker colors each row by its group's color.
	 * - An ungrouped plot's unscoped marker takes the plot's default series color.
	 *
	 * A marker's own `grouping`/`color` or flat color always wins. Scoped markers
	 * (`series`) are colored by their own series at render time, not here.
	 */
	static inheritPlotGrouping<TMarker extends { type: string }>(
		markers: TMarker[],
		plot: { grouping?: unknown; color?: unknown; defaultColor?: string }
	): TMarker[] {
		const grouping = plot.grouping ?? plot.color;
		return markers.map((marker) => {
			const m = marker as TMarker & MarkerLike & Record<string, unknown>;
			if (m.series !== undefined) return marker;
			if (grouping === undefined)
				return MarkerGrouping.withSeriesColor(m, plot.defaultColor) as TMarker;
			const updates: Record<string, unknown> = {};
			if (GROUPING_KINDS.has(m.type) && m.grouping === undefined) updates.grouping = grouping;
			if (COLOR_KINDS.has(m.type) && m.color === undefined && !MarkerGrouping.#hasFlatColor(m)) {
				updates.color = plot.color ?? plot.grouping;
			}
			return Object.keys(updates).length ? ({ ...m, ...updates } as TMarker) : marker;
		});
	}

	/**
	 * Gives a scoped hover marker its series color through its own `dot` and
	 * `text` styles, the way `withSeriesColor` does for other markers. A style the
	 * marker sets itself keeps its own color.
	 */
	static withHoverSeriesColor<T extends { dot?: object; text?: object }>(
		marker: T,
		color: string | undefined
	): T {
		if (!color) return marker;
		const dot = (marker.dot ?? {}) as { dotFill?: string; dotStroke?: string };
		const text = (marker.text ?? {}) as { fill?: string };
		return {
			...marker,
			dot: { ...dot, dotFill: dot.dotFill ?? color, dotStroke: dot.dotStroke ?? color },
			text: { ...text, fill: text.fill ?? color }
		};
	}
}
