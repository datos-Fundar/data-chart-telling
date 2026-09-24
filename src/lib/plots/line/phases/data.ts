import { paletteColor } from '$lib/utils/color';
import { buildSeries } from '$lib/utils/grouping';
import { omitDisabledSeries, buildSeriesColorIndex } from '$lib/plots/utils/legendDisabled';
import { buildGroupedSeries, buildScopedMarkerGroups } from '$lib/plots/utils/segments';
import type { Series } from '$lib/types/plots/data/common';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { LinePlotState, LinePlotCtx } from '$lib/types/plots/line/state';

/** LinePlot's "data" phase: resolved/legend-filtered/segment-grouped series and per-series color. */
export function buildData<TData extends Record<string, unknown>>(
	state: LinePlotState<TData>,
	ctx: LinePlotCtx
): LinePlotState<TData> {
	const { series, data, x, y, z, segments } = state;
	const { legendInteraction, cfg } = ctx;

	// Unfiltered series list, for stable per-name color indexing.
	const fullSeries = series ?? buildSeries(data!, x!, y!, z);
	const colorIndex = buildSeriesColorIndex(fullSeries);
	function colorForSeries(name: string): string {
		return paletteColor(colorIndex.get(name) ?? 0, cfg.palette);
	}

	// Drops series toggled off with `disabled: { mode: 'omit' }`.
	const resolvedSeries = omitDisabledSeries(fullSeries, legendInteraction);

	// connect: true (the default) — a line bridges its own segment
	// boundaries, unlike bar/scatter/pyramid's discrete marks.
	const groupedSeries = buildGroupedSeries<Series<TData>, LineSegmentStyle>(
		resolvedSeries,
		segments
	);

	const flat = resolvedSeries.flatMap((s) => s.data);

	const scopedGroups = buildScopedMarkerGroups<TData, Series<TData>, LineSegmentStyle>({
		groupedSeries,
		segments,
		colorFor: (s) => colorForSeries(s.name),
		segmentColorFor: (style, defaultColor) => style?.stroke?.stroke ?? defaultColor
	});

	return { ...state, resolvedSeries, groupedSeries, flat, scopedGroups, colorForSeries };
}
