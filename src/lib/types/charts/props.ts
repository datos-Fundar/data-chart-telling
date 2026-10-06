import type { Snippet } from 'svelte';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { AxisChannelName, ChannelAccessors } from '$lib/types/layout/mapping';
import type { MarkerTransform } from '$lib/types/transforms';
import type { AxisBasedStylesConfig, GapsAwarePlotStylesConfig } from '$lib/types/layout/styles';
import type { SegmentsConfig, MarginConfig } from '$lib/types/plots/props';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { TooltipProp } from '$lib/types/layout/tooltip';
import type { LegendSection } from '$lib/types/layout/legend';
import type { FacetConfig } from '$lib/types/layout/facet';
import type { TimelineConfig } from '$lib/types/layout/timeline';

/**
 * Common props accepted by every chart component (bar, line, heatmap, pyramid,
 * …). The `TSegmentStyle` parameter lets each chart narrow `segments` to its
 * own style shape while keeping everything else shared.
 *
 * Note: `color` is optional here (bar/line charts) but individual charts may
 * tighten it to required and/or narrow its value type (e.g. `number` for
 * heatmap).
 */
export type ChartProps<
	TRow extends Record<string, unknown>,
	TSegmentStyle extends object = object
> = {
	width: number;
	height: number;
	title?: string;
	subtitle?: string;
	caption?: string;
	header?: Snippet;
	footer?: Snippet;
	legend?: LegendSection[];
	data: TRow[];
	styles?: AxisBasedStylesConfig;
	segments?: SegmentsConfig<TSegmentStyle>;
	markers?: AxisBasedMarkersConfig[];
	scales?: AxisBasedScalesConfig<TRow>;
	/** Plot-level transforms (e.g. `stackY`), run over every series before the marks draw. */
	transforms?: MarkerTransform[];
	margins?: MarginConfig;
	facet?: FacetConfig<TRow>;
	timeline?: TimelineConfig<TRow>;
	tooltip?: TooltipProp<TRow>;
} & ChannelAccessors<TRow> &
	Required<Pick<ChannelAccessors<TRow>, AxisChannelName>>;

/**
 * `ChartProps` for the chart kinds with gap-fill (`BarChart`/`LineChart`/
 * `PyramidChart`) — identical shape, but `styles` accepts
 * `GapsAwarePlotStylesConfig<TSegmentStyle>` (adds `styles.gaps`) instead of
 * the plain `AxisBasedStylesConfig` every other chart kind uses.
 */
export type GapsAwareChartProps<
	TRow extends Record<string, unknown>,
	TSegmentStyle extends object = object
> = Omit<ChartProps<TRow, TSegmentStyle>, 'styles'> & {
	styles?: GapsAwarePlotStylesConfig<TSegmentStyle>;
};
