import { buildSeries } from '$lib/utils/grouping';
import { omitDisabledSeries, resolveSeriesColorFor } from '$lib/plots/utils/legendDisabled';
import { buildGroupedSeries, buildScopedMarkerGroups } from '$lib/plots/utils/segments';
import { resolveGapsForSeries, resolveDiscreteGapFills } from '$lib/plots/utils/gaps';
import type { Series } from '$lib/types/plots/data/common';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { BarPlotState, BarPlotCtx } from '$lib/types/plots/bar/state';

/** BarPlot's "data" phase: resolved/legend-filtered/segment-grouped series, gap fills, and per-series color. */
export function buildData<TData extends Record<string, unknown>>(
	state: BarPlotState<TData>,
	ctx: BarPlotCtx
): BarPlotState<TData> {
	const { series, data, x, y, grouping, color, segments, gaps, scales } = state;
	const { legendInteraction, cfg } = ctx;

	// Unfiltered series list, for stable per-name coloring. A lone `color`
	// accessor groups *and* colors series (the common case) — `grouping`
	// splits by a different field when given explicitly.
	const fullSeries = series ?? buildSeries(data!, x!, y!, grouping ?? color);
	const colorForSeries = resolveSeriesColorFor(fullSeries, scales.color, cfg.palette);

	// Drops series toggled off with `disabled: { mode: 'omit' }`.
	const resolvedSeries = omitDisabledSeries(fullSeries, legendInteraction);

	// connect: false — bars are discrete; there's no visual gap between
	// adjacent categories to bridge (see buildGroupedSeries's own doc).
	const groupedSeries = buildGroupedSeries<Series<TData>, BarSegmentStyle>(
		resolvedSeries,
		segments,
		false
	);

	// Fills leading/internal/trailing missing-data holes with an
	// interpolated, distinctly-styled bar, resolved per series like
	// `segments` — see `GapsAwarePlotStylesConfig` (`types/layout/styles.ts`).
	const gapFillMaps = new Map(
		resolvedSeries.map((s) => [
			s.name,
			resolveDiscreteGapFills(s, resolveGapsForSeries(gaps, s.name))
		])
	);

	const flat = resolvedSeries.flatMap((s) => s.data);

	const scopedGroups = buildScopedMarkerGroups<TData, Series<TData>, BarSegmentStyle>({
		groupedSeries,
		segments,
		colorFor: (s) => colorForSeries(s.name),
		segmentColorFor: (style, defaultColor) => style?.fill ?? defaultColor
	});

	return {
		...state,
		resolvedSeries,
		groupedSeries,
		gapFillMaps,
		flat,
		scopedGroups,
		colorForSeries
	};
}
