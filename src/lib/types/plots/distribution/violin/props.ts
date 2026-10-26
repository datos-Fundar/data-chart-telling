import type { BasePlotProps, PlotCoreProps } from '$lib/types/plots/props';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { SeriesProps, DataProps } from '$lib/types/plots/data/common';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { DensityKernel } from '$lib/types/transforms/density';
import type { InnerBoxOption } from '$lib/types/plots/distribution/box/inner';

/** How each category's density is estimated and scaled, on a plot that draws violins. */
export type ViolinEstimateStyles = {
	kernel?: DensityKernel;
	/** Kernel bandwidth in data units; Silverman's rule picks one per violin when unset. */
	bandwidth?: number;
	/** Cuts each violin at its values' own extent. Defaults to `true`; `false` lets the tails fade out past it, which the value axis does not reach. */
	trim?: boolean;
	/** `'width'` gives every violin the same full width; `'shared'` draws all of them on one density scale, so their areas compare. Defaults to `'width'`. */
	scale?: 'width' | 'shared';
};

/** `styles` of `ViolinPlot`: how each category's density is estimated and drawn. */
export type ViolinPlotStylesConfig = AxisBasedStylesConfig &
	ViolinEstimateStyles & {
		/** The box inside each violin: `false` leaves it out, a number sets its width in pixels, an object picks its parts. */
		box?: InnerBoxOption;
	};

/** `ViolinPlot`'s public props. */
export type ViolinPlotProps<TData extends Record<string, unknown>> = BasePlotProps<
	SeriesProps<TData> | DataProps<TData>,
	TData,
	ViolinPlotStylesConfig,
	AreaStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;

/** What `ViolinPlot`'s core draws from. */
export type ViolinPlotCoreProps<TData extends Record<string, unknown>> = PlotCoreProps<
	SeriesProps<TData> | DataProps<TData>,
	TData,
	ViolinPlotStylesConfig,
	AreaStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;
