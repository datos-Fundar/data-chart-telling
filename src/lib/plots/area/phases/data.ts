import { buildSeries } from '$lib/utils/grouping';
import { omitDisabledSeries, resolveSeriesColorFor } from '$lib/plots/utils/legendDisabled';
import { buildGroupedSeries, buildScopedMarkerGroups } from '$lib/plots/utils/segments';
import type { AreaPlotState, AreaPlotCtx } from '$lib/types/plots/area/state';
import type { Series } from '$lib/types/plots/data/common';
import type { AreaStyle } from '$lib/types/plots/styling';

/**
 * AreaPlot's "data" phase: resolves its series (from `series`, or grouped out
 * of flat rows), drops legend-disabled ones, and assigns each series its color.
 * An area has no segments of its own, so each series is one group.
 */
export function buildData<TData extends Record<string, unknown>>(
	state: AreaPlotState<TData>,
	ctx: AreaPlotCtx
): AreaPlotState<TData> {
	const { series, data, x, y, grouping, color, scales } = state;

	// Unfiltered series list, for stable per-name coloring. A lone `color`
	// accessor groups *and* colors series — `grouping` splits by a different
	// field when given explicitly.
	const fullSeries = series ?? buildSeries(data!, x!, y!, grouping ?? color);
	const colorForSeries = resolveSeriesColorFor(fullSeries, scales.color, ctx.cfg.palette);
	const resolvedSeries = omitDisabledSeries(fullSeries, ctx.legendInteraction);
	const flat = resolvedSeries.flatMap((s) => s.data);

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
		scopedGroups,
		groupedSeries
	};
}
