import type { MarginConfig } from '$lib/types/plots/common';
import type { Segments } from '$lib/types/plots/styles';
import type { TooltipRuntime } from '$lib/types/layout/tooltip';
import type { GeoDataProps, GeoFeature } from '$lib/types/plots/geo/common';
import type { GeoStyles, GeoSegmentStyle } from '$lib/types/plots/geo/styles';
import type { GeoScalesConfig } from '$lib/types/plots/geo/scales';
import type { GeoMarker } from '$lib/types/plots/geo/markers';

/**
 * Props accepted by `GeoPlot`. Structurally parallel to `PlotProps` — same
 * names/roles for `width`/`height`/`styles`/`segments`/`markers`/`scales`/
 * `margins`/`tooltip` — but not an extension of it: geographic data has no
 * x/y/z axis pair, so `data` here is the map itself (see `GeoDataProps`)
 * rather than `SeriesProps | DataProps`.
 */
export type GeoPlotProps<TProps extends Record<string, unknown> = Record<string, unknown>> = GeoDataProps<TProps> & {
  width: number;
  height: number;
  styles?: GeoStyles<TProps>;
  /** Keyed by feature id (see `featureId`) — e.g. `segments: { argentina: [{ style: { fill: 'tomato' } }] }`. */
  segments?: Segments<GeoSegmentStyle>;
  markers?: GeoMarker[];
  scales?: GeoScalesConfig;
  margins?: MarginConfig;
  tooltip?: TooltipRuntime<GeoFeature<TProps>>;
};
