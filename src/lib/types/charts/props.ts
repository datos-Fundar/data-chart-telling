import type { Snippet } from 'svelte';
import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { Accessor } from '$lib/types/plots/data/common';
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
 * Note: `z` is optional here (bar/line charts) but individual charts may
 * tighten it to required and/or narrow its value type (e.g. `number` for
 * heatmap).
 */
export type ChartProps<
  TRow extends Record<string, unknown>,
  TSegmentStyle extends object = object,
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
  x: Accessor<TRow, AxisValue>;
  y: Accessor<TRow, AxisValue>;
  z?: Accessor<TRow, unknown>;
  styles?: AxisBasedStylesConfig;
  segments?: SegmentsConfig<TSegmentStyle>;
  markers?: AxisBasedMarkersConfig[];
  scales?: AxisBasedScalesConfig<TRow>;
  margins?: MarginConfig;
  facet?: FacetConfig<TRow>;
  timeline?: TimelineConfig<TRow>;
  tooltip?: TooltipProp<TRow>;
};

/**
 * `ChartProps` for the chart kinds with gap-fill (`BarChart`/`LineChart`/
 * `PyramidChart`) — identical shape, but `styles` accepts
 * `GapsAwarePlotStylesConfig<TSegmentStyle>` (adds `styles.gaps`) instead of
 * the plain `AxisBasedStylesConfig` every other chart kind uses.
 */
export type GapsAwareChartProps<
  TRow extends Record<string, unknown>,
  TSegmentStyle extends object = object,
> = Omit<ChartProps<TRow, TSegmentStyle>, 'styles'> & {
  styles?: GapsAwarePlotStylesConfig<TSegmentStyle>;
};
