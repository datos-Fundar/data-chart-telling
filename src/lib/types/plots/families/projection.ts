import type { BasePlotProps, PlotCoreProps } from '$lib/types/plots/props';
import type { GeoScalesConfig, CoordinatesConfig } from '$lib/types/layout/coordinates';
import type { GeoFeature, GeoSliceContext } from '$lib/types/plots/data/geo';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import type { TimelineConfig } from '$lib/types/layout/timeline';
import type { FacetConfig } from '$lib/types/layout/facet';
import type { TooltipContext } from '$lib/types/layout/tooltip';

/** `Omit` on each member of a union, so the union (and what tells its members apart) survives. */
type OmitEach<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/**
 * A projection kind's public props: its data contract, with the markers, scales and coordinates of a projected map.
 * Its `timeline` and `facet` slice both its features (by a field of their `properties`) and every marker's own
 * `data` rows; a feature or row without the field is drawn in every slice.
 */
export type ProjectionPlotProps<
	TDataContract,
	TProps extends Record<string, unknown>,
	TStyles extends object,
	TSegmentStyle extends object,
	TTooltipContext extends TooltipContext = TooltipContext
> = OmitEach<
	BasePlotProps<
		TDataContract,
		GeoFeature<TProps>,
		TStyles,
		TSegmentStyle,
		GeoMarkersConfig,
		GeoScalesConfig,
		CoordinatesConfig,
		TTooltipContext
	>,
	'timeline' | 'facet'
> & {
	timeline?: TimelineConfig<Record<string, unknown>>;
	facet?: FacetConfig<Record<string, unknown>>;
};

/** What a geo kind's core draws from. */
export type ProjectionPlotCoreProps<
	TDataContract,
	TProps extends Record<string, unknown>,
	TStyles extends object,
	TSegmentStyle extends object
> = PlotCoreProps<
	TDataContract,
	GeoFeature<TProps>,
	TStyles,
	TSegmentStyle,
	GeoMarkersConfig,
	GeoScalesConfig,
	CoordinatesConfig
> & {
	/** The slice of the `timeline` and `facet` this core draws - what its callbacks read its features in. */
	sliceContext?: GeoSliceContext;
};
