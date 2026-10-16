import type { BasePlotProps, PlotCoreProps } from '$lib/types/plots/props';
import type { GeoScalesConfig, CoordinatesConfig } from '$lib/types/layout/coordinates';
import type { GeoFeature, GeoDataProps } from '$lib/types/plots/data/geo';
import type { GeoStylesConfig } from '$lib/types/layout/styles';
import type { GeoSegmentStyle } from '$lib/types/plots/segments/common';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import type { TimelineConfig } from '$lib/types/layout/timeline';
import type { FacetConfig } from '$lib/types/layout/facet';

/** `Omit` on each member of a union, so the union (and what tells its members apart) survives. */
type OmitEach<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/**
 * `GeoPlot`'s public props. Its `timeline` and `facet` slice both the map's
 * features (reading a field key from each feature's `properties`) and every
 * marker's own `data` rows; a feature or row without the field is context,
 * drawn in every slice.
 */
export type GeoPlotProps<TProps extends Record<string, unknown>> = OmitEach<
	BasePlotProps<
		GeoDataProps<TProps>,
		GeoFeature<TProps>,
		GeoStylesConfig<TProps>,
		GeoSegmentStyle,
		GeoMarkersConfig,
		GeoScalesConfig,
		CoordinatesConfig
	>,
	'timeline' | 'facet'
> & {
	timeline?: TimelineConfig<Record<string, unknown>>;
	facet?: FacetConfig<Record<string, unknown>>;
};

/** What `GeoPlot`'s core draws from. */
export type GeoPlotCoreProps<TProps extends Record<string, unknown>> = PlotCoreProps<
	GeoDataProps<TProps>,
	GeoFeature<TProps>,
	GeoStylesConfig<TProps>,
	GeoSegmentStyle,
	GeoMarkersConfig,
	GeoScalesConfig,
	CoordinatesConfig
>;
