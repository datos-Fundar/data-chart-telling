import { buildSeries } from '$lib/utils/grouping';
import { omitDisabledSeries, resolveSeriesColorFor } from '$lib/plots/utils/legendDisabled';
import { buildGroupedSeries, buildScopedMarkerGroups } from '$lib/plots/utils/segments';
import type { Series } from '$lib/types/plots/data/common';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { HistogramPlotState, HistogramPlotCtx } from '$lib/types/plots/histogram/state';

/**
 * HistogramPlot's "data" phase: resolves its series (from `series`, or grouped
 * out of flat rows), drops legend-omitted ones, and assigns each series its color.
 * A histogram reads only `x`, so a flat series' `y` is `x` too — a placeholder
 * that keeps every series in the shape the rest of the plot expects.
 */
export function buildData<TData extends Record<string, unknown>>(
	state: HistogramPlotState<TData>,
	ctx: HistogramPlotCtx
): HistogramPlotState<TData> {
	const { series, data, x, grouping, color, scales } = state;

	const fullSeries = series ?? buildSeries(data!, x!, x!, grouping ?? color);
	const colorForSeries = resolveSeriesColorFor(fullSeries, scales.color, ctx.cfg.palette);
	const resolvedSeries = omitDisabledSeries(fullSeries, ctx.legendInteraction);
	const flat = resolvedSeries.flatMap((s) => s.data);

	// Each series splits into its visual segments: one catch-all group per series
	// unless the plot's own `segments` restyle some of its bars.
	const segments = state.segments ?? {};
	const groupedSeries = buildGroupedSeries<Series<TData>, AreaStyle>(resolvedSeries, segments);
	const scopedGroups = buildScopedMarkerGroups<TData, Series<TData>, AreaStyle>({
		groupedSeries,
		segments,
		colorFor: (s) => colorForSeries(s.name),
		segmentColorFor: (style, defaultColor) => style?.fill ?? defaultColor
	});

	return {
		...state,
		resolvedSeries,
		allSeriesNames: fullSeries.map((s) => s.name),
		flat,
		colorForSeries,
		groupedSeries,
		scopedGroups
	};
}
