import type {
	ProjectionPlotProps,
	ProjectionPlotCoreProps
} from '$lib/types/plots/families/projection';
import type { GeoDataProps, GeoSliceContext } from '$lib/types/plots/data/geo';
import type { PlotRowContext } from '$lib/types/layout/context';
import type { GeoStylesConfig } from '$lib/types/layout/styles';
import type { GeoSegmentStyle } from '$lib/types/plots/segments/common';

/** `GeoPlot`'s public props: GeoJSON or TopoJSON in `data`. */
export type GeoPlotProps<TProps extends Record<string, unknown>> = ProjectionPlotProps<
	GeoDataProps<TProps>,
	TProps,
	GeoStylesConfig<TProps>,
	GeoSegmentStyle,
	GeoTooltipContext
>;

/** What a tooltip's `format` knows of a hovered feature: the shared row context, and the slice it was drawn in. */
export type GeoTooltipContext = PlotRowContext & GeoSliceContext;

/** What `GeoPlot`'s core draws from. */
export type GeoPlotCoreProps<TProps extends Record<string, unknown>> = ProjectionPlotCoreProps<
	GeoDataProps<TProps>,
	TProps,
	GeoStylesConfig<TProps>,
	GeoSegmentStyle
>;
