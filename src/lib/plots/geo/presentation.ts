import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { GeoFeature } from '$lib/types/plots/data/geo';
import type { GeoPlotCoreProps } from '$lib/types/plots/geo/props';
import type { PlotPresentation } from '$lib/types/plots/presentation';

/** GeoPlot's defaults: hover one feature. */
export function buildGeoPresentation<TProps extends Record<string, unknown>>(
	_props: GeoPlotCoreProps<TProps>,
	_cfg: PlotStylesConfig
): PlotPresentation<GeoFeature<TProps>> {
	return { hoverStrategy: 'punctual' };
}
