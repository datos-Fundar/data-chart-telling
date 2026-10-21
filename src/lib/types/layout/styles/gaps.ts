import type { GapsConfig } from '$lib/types/plots/gaps';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles/base';

/**
 * `AxisBasedStylesConfig` extended with `gaps` - the interpolated
 * missing-data bridge fill available to plot kinds with an inherent
 * category/sequence ordering (`LinePlot`, `BarPlot`, `PyramidPlot`).
 * Resolved per series like `segments`, at zone granularity - see
 * {@link GapsConfig}.
 */
export type GapsAwarePlotStylesConfig<TSegmentStyle extends object> = AxisBasedStylesConfig & {
	gaps?: GapsConfig<TSegmentStyle>;
};
