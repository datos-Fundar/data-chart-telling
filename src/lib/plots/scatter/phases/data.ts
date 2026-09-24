import { paletteColor } from '$lib/utils/color';
import { buildSeries } from '$lib/utils/grouping';
import { omitDisabledSeries, buildSeriesColorIndex } from '$lib/plots/utils/legendDisabled';
import { buildGroupedSeries, buildScopedMarkerGroups } from '$lib/plots/utils/segments';
import type { Series } from '$lib/types/plots/data/common';
import type { ScatterSegmentStyle } from '$lib/types/plots/segments/common';
import type { ScatterPlotState, ScatterPlotCtx } from '$lib/types/plots/scatter/state';

/** ScatterPlot's "data" phase: resolved/legend-filtered/segment-grouped series and per-series color. */
export function buildData<TData extends Record<string, unknown>>(
	state: ScatterPlotState<TData>,
	ctx: ScatterPlotCtx
): ScatterPlotState<TData> {
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

	// A scatter point cloud is discrete (no connecting line), so adjacent
	// segments never need a bridge point at their boundary — see
	// buildGroupedSeries's own doc.
	const groupedSeries = buildGroupedSeries<Series<TData>, ScatterSegmentStyle>(
		resolvedSeries,
		segments,
		false
	);

	const flat = resolvedSeries.flatMap((s) => s.data);

	const scopedGroups = buildScopedMarkerGroups<TData, Series<TData>, ScatterSegmentStyle>({
		groupedSeries,
		segments,
		colorFor: (s) => colorForSeries(s.name),
		segmentColorFor: (style, defaultColor) => style?.dotFill ?? defaultColor
	});

	return { ...state, resolvedSeries, groupedSeries, flat, scopedGroups, colorForSeries };
}
