import { paletteColor } from '$lib/utils/color';
import { buildSeries } from '$lib/utils/grouping';
import { omitDisabledSeries, buildSeriesColorIndex } from '$lib/plots/utils/legendDisabled';
import { buildGroupedSeries, buildScopedMarkerGroups } from '$lib/plots/utils/segments';
import { resolveGapsForSeries, resolveDiscreteGapFills } from '$lib/plots/utils/gaps';
import type { DiscreteGapFill } from '$lib/plots/utils/gaps';
import type { Series, Accessor } from '$lib/types/plots/data/common';
import type { AxisValue } from '$lib/types/layout/scales';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { GapZonesConfig } from '$lib/types/plots/gaps';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { LegendInteractionStore } from '$lib/types/layout/legend';
import type { ScopedMarkerGroup } from '$lib/types/layout/geometry';

export type BarSeries<TData extends Record<string, unknown>> = {
	resolvedSeries: Series<TData>[];
	groupedSeries: VisualGroup<Series<TData>, BarSegmentStyle>[];
	gapFillMaps: Map<string, Map<TData, DiscreteGapFill<BarSegmentStyle>>>;
	flat: TData[];
	scopedGroups: ScopedMarkerGroup<TData>[];
	colorForSeries: (name: string) => string;
};

/** BarPlot's resolved/legend-filtered/segment-grouped series, gap fills, and per-series color. */
export function buildData<TData extends Record<string, unknown>>(args: {
	series?: Series<TData>[];
	data?: TData[];
	x?: Accessor<TData, AxisValue>;
	y?: Accessor<TData, AxisValue>;
	z?: Accessor<TData, unknown>;
	segments: SegmentsConfig<BarSegmentStyle>;
	gaps: Record<string, GapZonesConfig<BarSegmentStyle>>;
	legendInteraction: LegendInteractionStore | null | undefined;
	palette: string[];
}): BarSeries<TData> {
	const { series, data, x, y, z, segments, gaps, legendInteraction, palette } = args;

	// Unfiltered series list, for stable per-name color indexing.
	const fullSeries = series ?? buildSeries(data!, x!, y!, z);
	const colorIndex = buildSeriesColorIndex(fullSeries);
	function colorForSeries(name: string): string {
		return paletteColor(colorIndex.get(name) ?? 0, palette);
	}

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

	return { resolvedSeries, groupedSeries, gapFillMaps, flat, scopedGroups, colorForSeries };
}
