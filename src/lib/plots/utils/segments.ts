import { resolveAccessor } from '$lib/utils/accessors';
import { merge } from '$lib/utils/merge';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { Series } from '$lib/types/plots/data/common';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { Area, Segment, VisualGroup, VisualSegment } from '$lib/types/plots/segments/config';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { ScopedMarkerGroup } from '$lib/types/layout/geometry';

const DEFAULT_KEY = 'default';

/**
 * Returns the flat {@link Segment} list for one series.
 * Series-specific segments are added before `'default'` segments so that
 * series-specific catch-alls win over default catch-alls on tie-breaks.
 */
export function resolveSegmentsForSeries<TStyle>(
	segments: SegmentsConfig<TStyle>,
	seriesName: string
): Segment<TStyle>[] {
	const specific = segments[seriesName] ?? [];
	const defaults = segments[DEFAULT_KEY] ?? [];
	return [...specific, ...defaults];
}

/** Returns true when `xVal` falls inside any of a segment's x ranges. */
export function matchesSegmentX<TStyle>(xVal: AxisValue, seg: Segment<TStyle>): boolean {
	const areas = seg.areas;
	if (!areas || areas.length === 0) return true;
	return areas.some((area) => areaMatchesX(xVal, area));
}

/* eslint-disable @typescript-eslint/no-explicit-any -- axis values compare across number, string and Date */
function areaMatchesX(xVal: AxisValue, area: Area): boolean {
	if (!area.x) return true;
	return (
		(area.x.from === undefined || (xVal as any) >= area.x.from) &&
		(area.x.to === undefined || (xVal as any) <= area.x.to)
	);
}

function areaMatchesXY(xVal: AxisValue, yVal: AxisValue, area: Area): boolean {
	if (!areaMatchesX(xVal, area)) return false;
	if (!area.y) return true;
	return (
		(area.y.from === undefined || (yVal as any) >= area.y.from) &&
		(area.y.to === undefined || (yVal as any) <= area.y.to)
	);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Warns about obvious configuration mistakes: multiple catch-all segments
 * (no `areas`) in the same series list. Since catch-alls are evaluated last
 * and in order, only the first one can ever match; later ones are dead code.
 */
export function validateSegments<TStyle>(segments: SegmentsConfig<TStyle>): void {
	const check = (label: string, segs: Segment<TStyle>[]) => {
		const catchAlls = segs.filter((s) => !s.areas || s.areas.length === 0).length;
		if (catchAlls > 1) {
			console.warn(
				`segments ${label}: ${catchAlls} entries have no areas - ` +
					`only the first catch-all's style will be used.`
			);
		}
	};
	for (const [key, segs] of Object.entries(segments)) {
		check(key === DEFAULT_KEY ? '(default)' : `"${key}"`, segs);
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveSeriesSegments<S extends Series<any>, TStyle>(
	series: S,
	segs: Segment<TStyle>[],
	connect: boolean,
	gather: boolean
): VisualSegment<S['data'][number], TStyle>[] {
	if (!segs.length) {
		return [{ data: series.data, styles: {} as TStyle, scales: undefined }];
	}

	const getX = readChannel(series.x);
	const getY = readChannel(series.y);

	type DataPoint = S['data'][number];

	// Evaluate area-specific segments before catch-alls (no areas), preserving
	// relative order within each group. This lets a catch-all placed first in
	// the list act as a fallback baseline rather than matching everything.
	const evalOrder = segs
		.map((seg, i) => ({ seg, i }))
		.sort((a, b) => {
			const aSpecific = a.seg.areas != null && a.seg.areas.length > 0;
			const bSpecific = b.seg.areas != null && b.seg.areas.length > 0;
			if (aSpecific === bSpecific) return a.i - b.i;
			return aSpecific ? -1 : 1;
		});

	// For each data point, find the first matching segment index (-1 = unmatched).
	const matchIdx = series.data.map((d) => {
		const xVal = getX(d) as AxisValue;
		const yVal = getY(d) as AxisValue;
		const found = evalOrder.find(({ seg }) => {
			const areas = seg.areas;
			if (!areas || areas.length === 0) return true;
			return areas.some((area) => areaMatchesXY(xVal, yVal, area));
		});
		return found !== undefined ? found.i : -1;
	});

	// Group consecutive data points into runs by their matched segment index.
	// Each run becomes its own visual segment (mark), preventing Observable Plot
	// from drawing lines across non-contiguous areas of the same Segment. With
	// `gather`, each segment index is one run of every row it matched, in order.
	type Run = { data: DataPoint[]; segIdx: number };
	const runs: Run[] = [];
	for (let i = 0; i < series.data.length; i++) {
		const idx = matchIdx[i];
		const own = gather ? runs.find((run) => run.segIdx === idx) : runs[runs.length - 1];
		if (own && own.segIdx === idx) {
			own.data.push(series.data[i]);
		} else {
			runs.push({ data: [series.data[i]], segIdx: idx });
		}
	}

	// Connector lines need to match the catch-all's stroke so they don't reveal
	// the default palette color when the user has set a baseline via catch-all.
	// Dots are excluded to avoid duplicate marks at the shared boundary points.
	const catchAll = segs.find((s) => !s.areas || s.areas.length === 0);
	const connectorStyle: TStyle = (() => {
		if (!catchAll?.styles) return {} as TStyle;
		const rest = { ...(catchAll.styles as Record<string, unknown>) };
		delete rest.dots;
		return rest as TStyle;
	})();

	const defaultVisual: VisualSegment<DataPoint, TStyle>[] = [];
	const connectors: VisualSegment<DataPoint, TStyle>[] = [];
	const userVisual: VisualSegment<DataPoint, TStyle>[] = [];

	for (let r = 0; r < runs.length; r++) {
		const run = runs[r];
		if (run.segIdx === -1) {
			// Unmatched run: for a continuous mark (line), insert bridge points so
			// it connects to adjacent user segments without a visual gap. Discrete
			// marks (bar, pyramid) have no such gap to bridge - bridging would just
			// duplicate the neighboring runs' boundary rows as an extra, wrongly
			// styled mark at that same category.
			const bridged: DataPoint[] = [...run.data];
			if (connect) {
				if (r > 0) bridged.unshift(runs[r - 1].data[runs[r - 1].data.length - 1]);
				if (r < runs.length - 1) bridged.push(runs[r + 1].data[0]);
			}
			defaultVisual.push({ data: bridged, styles: {} as TStyle, scales: undefined });
		} else {
			const seg = segs[run.segIdx];
			const segStyle = seg.styles ?? ({} as TStyle);
			// Area-specific segments merge the catch-all as a baseline: catch-all
			// keys fill in whatever the area segment omits; the area wins on conflict.
			const isAreaSpecific = seg.areas != null && seg.areas.length > 0;
			const resolvedStyle: TStyle =
				isAreaSpecific && catchAll?.styles
					? (merge(catchAll.styles as object, segStyle as object) as TStyle)
					: segStyle;
			const resolvedScales =
				seg.scales ?? (isAreaSpecific && catchAll?.scales ? catchAll.scales : undefined);
			userVisual.push({ data: run.data, styles: resolvedStyle, scales: resolvedScales });
			// When the next run is also a user segment (no unmatched data between them),
			// insert a line-only connector so the lines join without a gap. Using a
			// separate mark (rather than appending a bridge point to the current run)
			// avoids rendering an extra dot at the shared boundary point. Skipped
			// entirely for discrete marks (see above) - it would duplicate both
			// runs' boundary rows as an extra mark.
			const nextRun = runs[r + 1];
			if (connect && nextRun && nextRun.segIdx !== -1) {
				connectors.push({
					data: [run.data[run.data.length - 1], nextRun.data[0]],
					styles: connectorStyle,
					scales: undefined
				});
			}
		}
	}

	if (defaultVisual.length === 0 && connectors.length === 0) return userVisual;

	// Defaults and connectors render first so user segments paint on top at
	// their endpoints, ensuring the correct dot style at boundary points.
	return [...defaultVisual, ...connectors, ...userVisual];
}

/**
 * Builds the full list of visual groups - one per series - ready to render.
 * Each group's `visualSegments` is derived by resolving the flat segment list
 * for that series from all groups in `segments`.
 *
 * `connect` bridges adjacent visual segments so a *continuous* mark (line)
 * has no visual gap at their boundary - the default, since `buildGroupedSeries`
 * itself defaults `TStyle` to {@link LineSegmentStyle}. Discrete marks (bar,
 * pyramid) have no gap to bridge; pass `connect: false` so boundary rows
 * aren't duplicated as an extra, separately-styled mark.
 *
 * `gather` makes each segment's rows one visual segment wherever they fall,
 * for a mark that summarizes a category's rows (box, violin), whose rows need
 * not come in order. It implies no `connect`.
 */
/** A position channel's accessor, reading nothing when the series doesn't set it. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function readChannel(accessor: Series<any>['x']): (row: any) => unknown {
	return accessor === undefined ? () => undefined : resolveAccessor(accessor);
}

export function buildGroupedSeries<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	S extends Series<any>,
	TStyle = LineSegmentStyle
>(
	seriesList: S[],
	segments: SegmentsConfig<TStyle> = {},
	connect = true,
	gather = false
): VisualGroup<S, TStyle>[] {
	return seriesList.map((s) => ({
		series: s,
		visualSegments: resolveSeriesSegments<S, TStyle>(
			s,
			resolveSegmentsForSeries(segments, s.name),
			connect && !gather,
			gather
		)
	}));
}

/**
 * Builds the `ScopedMarkerGroup[]` a `Plot.svelte` hands to `GeometryLayout`
 * for rendering `series`-scoped `hover`/`component` markers - one group per
 * series, carrying its resolved segments' match predicates and colors.
 * `colorFor` resolves a series' own default color; `segmentColorFor` reads
 * whichever field counts as "color" out of that plot kind's segment style
 * shape (e.g. `fill` vs `stroke.stroke`), since that's the only part of this
 * that isn't shared across plot kinds.
 */
export function buildScopedMarkerGroups<
	TData extends Record<string, unknown>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	S extends Series<any>,
	TStyle
>(args: {
	groupedSeries: VisualGroup<S, TStyle>[];
	segments?: SegmentsConfig<TStyle>;
	colorFor: (series: S, seriesIndex: number) => string;
	segmentColorFor: (styles: TStyle | undefined, defaultColor: string) => string;
}): ScopedMarkerGroup<TData>[] {
	const { groupedSeries, segments = {}, colorFor, segmentColorFor } = args;
	return groupedSeries.map((group, seriesIndex) => {
		const defaultColor = colorFor(group.series, seriesIndex);
		const xFor = readChannel(group.series.x);
		const segs = resolveSegmentsForSeries(segments, group.series.name);
		return {
			name: group.series.name,
			...(group.series.id !== undefined ? { id: group.series.id } : {}),
			...(group.series.panel !== undefined ? { panel: group.series.panel } : {}),
			data: group.series.data as TData[],
			color: defaultColor,
			segments: segs.map((seg) => ({
				match: (row: TData) => matchesSegmentX(xFor(row) as AxisValue, seg),
				color: segmentColorFor(seg.styles, defaultColor)
			}))
		};
	});
}
