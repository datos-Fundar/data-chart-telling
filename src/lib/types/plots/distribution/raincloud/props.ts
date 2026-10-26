import type { BasePlotProps, PlotCoreProps } from '$lib/types/plots/props';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { SeriesProps, DataProps } from '$lib/types/plots/data/common';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { InnerBoxStyle } from '$lib/types/plots/distribution/box/inner';
import type { ViolinEstimateStyles } from '$lib/types/plots/distribution/violin/props';

/** The box of a `RaincloudPlot`: its parts and width, and where it sits. */
export type RaincloudBoxStyle = InnerBoxStyle & {
	/** Over the density (`'cloud'`), over the dots (`'rain'`) or in the gap between them (`'between'`). Defaults to `'between'`. */
	position?: 'cloud' | 'rain' | 'between';
};

/** The dots of a `RaincloudPlot`: one per value. A `jitterX` (or `jitterY`) in the plot's `transforms` sets their scatter: its `seed`, `distribution` and `width`. */
export type RaincloudRainStyle = {
	/** Radius in pixels. */
	r?: number;
	/** Fill opacity. */
	opacity?: number;
};

/** `styles` of `RaincloudPlot`: how each category's density is estimated, and its box and dots drawn. */
export type RaincloudPlotStylesConfig = AxisBasedStylesConfig &
	ViolinEstimateStyles & {
		/** The box: `false` leaves it out, a number sets its width in pixels, an object picks its parts and position. */
		box?: boolean | number | RaincloudBoxStyle;
		/** The dots: `false` leaves them out. */
		rain?: false | RaincloudRainStyle;
	};

/** `RaincloudPlot`'s public props. */
export type RaincloudPlotProps<TData extends Record<string, unknown>> = BasePlotProps<
	SeriesProps<TData> | DataProps<TData>,
	TData,
	RaincloudPlotStylesConfig,
	AreaStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;

/** What `RaincloudPlot`'s core draws from. */
export type RaincloudPlotCoreProps<TData extends Record<string, unknown>> = PlotCoreProps<
	SeriesProps<TData> | DataProps<TData>,
	TData,
	RaincloudPlotStylesConfig,
	AreaStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;
