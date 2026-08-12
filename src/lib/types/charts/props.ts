import type { Snippet } from 'svelte';
import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { Accessor } from '$lib/types/plots/data/common';
import type { BasePlotStylesConfig } from '$lib/types/layout/styles';
import type { SegmentsConfig, MarginConfig } from '$lib/types/plots/props';
import type { Marker } from '$lib/types/markers/common';
import type { TooltipProp } from '$lib/types/layout/tooltip';
import type { LegendSection } from '$lib/types/charts/legend';
import type { FacetConfig, TimelineConfig } from '$lib/types/charts/common';

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
  styles?: BasePlotStylesConfig;
  segments?: SegmentsConfig<TSegmentStyle>;
  markers?: Marker[];
  scales?: AxisBasedScalesConfig<TRow>;
  margins?: MarginConfig;
  facet?: FacetConfig<TRow>;
  timeline?: TimelineConfig<TRow>;
  tooltip?: TooltipProp<TRow>;
};
