import type { Marker } from '$lib/types/plots/markers';
import type { TooltipRuntime } from '$lib/types/layout/tooltip';
import type { PlotStyles, Segments } from '$lib/types/plots/styles';
import type { SeriesProps, DataProps, ScalesConfig, MarginConfig } from '$lib/types/plots/common';

/**
 * Common props accepted by every plot component (bar, line, heatmap, pyramid,
 * …). The `TSegmentStyle` parameter lets each plot narrow `segments` to its
 * own style shape ({@link BarSegmentStyle}, {@link LineSegmentStyle}, etc.)
 * while keeping everything else shared.
 *
 * Data can be provided either as pre-built {@link SeriesProps} or as flat
 * rows via {@link DataProps}.
 */
export type PlotProps<
  TData extends Record<string, unknown>,
  TSegmentStyle extends object = object,
> = (SeriesProps<TData> | DataProps<TData>) & {
  width: number;
  height: number;
  styles?: PlotStyles;
  segments?: Segments<TSegmentStyle>;
  markers?: Marker[];
  scales?: ScalesConfig;
  margins?: MarginConfig;
  tooltip?: TooltipRuntime<TData>;
};