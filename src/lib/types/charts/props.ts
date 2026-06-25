import type { Accessor, AxisValue, ScalesConfig } from '$lib/types/plots/common';
import type { PlotStyles, SegmentsMap } from '$lib/types/plots/styles';
import type { Marker } from '$lib/types/plots/markers';
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
  legend?: LegendSection[];
  data: TRow[];
  x: Accessor<TRow, AxisValue>;
  y: Accessor<TRow, AxisValue>;
  z?: Accessor<TRow, unknown>;
  styles?: PlotStyles;
  segments?: SegmentsMap<TSegmentStyle>;
  markers?: Marker[];
  scales?: ScalesConfig;
  facet?: FacetConfig<TRow>;
  timeline?: TimelineConfig<TRow>;
  tooltip?: TooltipProp<TRow>;
};
