import { resolveTransforms } from '$lib/utils/transforms';
import { inheritPlotGrouping, withSeriesColor } from '$lib/utils/markerGrouping';
import { SERIES_KEY } from '$lib/layout/phases/transforms';
import type { ProcessedData } from '$lib/types/layout/phases';
import type { MarkerConfig } from '$lib/types/markers/all';
import type { ScopedMarkerGroup } from '$lib/types/layout/geometry';

type Row = Record<string, unknown>;

/** Kinds that handle `scope: 'segment'` themselves, at render time. */
const RENDER_SCOPED_KINDS = new Set(['component', 'hover']);

/**
 * Prepares a plot's own author markers for the rest of its pipeline: inherits
 * the plot's grouping and default color first (a transform's `z` defaults to
 * the grouping), splits a segment-scoped marker into one marker per segment of
 * its series, then runs each marker's own transforms over its rows - its
 * segment's or series' rows when it's scoped to one, the plot's rows otherwise.
 */
export function prepareAuthorMarkers<
	T extends { type: string; component?: unknown; props?: unknown }
>(
	markers: T[],
	plot: {
		grouping?: unknown;
		color?: unknown;
		defaultColor?: string;
		flat: Row[];
		resolvedSeries?: { name: string; data: Row[] }[];
		scopedGroups?: ScopedMarkerGroup<Row>[];
	}
): T[] {
	return inheritPlotGrouping(markers, plot).flatMap((marker) => {
		const scope = (marker as { series?: unknown }).series;
		const seriesRows =
			typeof scope === 'string'
				? plot.resolvedSeries?.find((s) => s.name === scope)?.data
				: undefined;
		const rows = seriesRows ?? plot.flat;
		return splitBySegment(marker, rows, plot.scopedGroups).map((own) =>
			resolveTransforms(own, rows)
		);
	});
}

/**
 * One marker per segment of a `scope: 'segment'` marker's series, each over
 * that segment's rows and in its color. Any other marker is kept whole.
 */
function splitBySegment<T extends { type: string }>(
	marker: T,
	rows: Row[],
	scopedGroups: ScopedMarkerGroup<Row>[] = []
): T[] {
	const own = marker as T & { series?: unknown; scope?: unknown; data?: Row[] };
	if (own.scope !== 'segment' || RENDER_SCOPED_KINDS.has(own.type)) return [marker];
	const group = scopedGroups.find((g) => g.name === own.series);
	if (!group || group.segments.length === 0) return [marker];
	return group.segments
		.map((seg) => ({ seg, data: (own.data ?? rows).filter((row) => seg.match(row)) }))
		.filter(({ data }) => data.length > 0)
		.map(({ seg, data }) => withSeriesColor({ ...own, data }, seg.color) as T);
}

/**
 * Whether each marker kind draws the plot's rows when it has no `data` of its
 * own - the kinds `GeometryLayout` hands `marker.data ?? rows`. Typed over
 * every kind, so a new kind can't be added without choosing its value.
 */
const DRAWS_ROWS_DEFAULTS = {
	area: true,
	arrow: true,
	bar: true,
	bollinger: true,
	brush: false,
	box: true,
	cell: true,
	component: false,
	contour: false,
	delaunayLink: true,
	delaunayMesh: true,
	delta: false,
	density: true,
	difference: true,
	dot: true,
	geo: false,
	'geo-component': true,
	'geo-hover': false,
	graticule: false,
	hover: false,
	hull: true,
	image: true,
	inset: false,
	line: true,
	link: false,
	raster: true,
	rect: true,
	regression: true,
	rule: false,
	sphere: false,
	text: true,
	tick: true,
	trail: true,
	vector: false,
	voronoi: true,
	voronoiMesh: true,
	waffle: true
} satisfies Record<MarkerConfig['type'], boolean>;

/** Whether a marker's kind draws the plot's rows when it sets no `data`. */
function drawsRows(type: string): boolean {
	return type in DRAWS_ROWS_DEFAULTS && DRAWS_ROWS_DEFAULTS[type as MarkerConfig['type']];
}

/**
 * A marker that draws the plot's rows (it sets no `data`) draws them as the
 * plot does, after the plot's own transforms: it starts from the plot's
 * processed rows - its series' rows when scoped to one - and takes the
 * processed channels for any position it leaves unset. A position it sets
 * itself reads that field of the processed rows (every source field is kept).
 * Its `grouping` defaults to the plot's series, so it splits, and its own
 * transforms run, per series. A plot without transforms draws its rows as
 * they are, so its markers are left as is, as is a kind that draws no rows.
 */
export function withProcessedRows<T extends { type: string }>(
	marker: T,
	processed?: ProcessedData
): T {
	const own = marker as T & {
		data?: unknown;
		series?: unknown;
		grouping?: unknown;
	} & Record<string, unknown>;
	if (own.data !== undefined || !drawsRows(own.type) || !processed?.transforms.length) {
		return marker;
	}
	const rows =
		typeof own.series === 'string'
			? processed.data.filter((row) => row[SERIES_KEY] === own.series)
			: processed.data;
	const channels = Object.fromEntries(
		Object.entries(processed.channels).filter(([key]) => own[key] === undefined)
	);
	return { ...own, ...channels, data: rows, grouping: own.grouping ?? SERIES_KEY } as T;
}
