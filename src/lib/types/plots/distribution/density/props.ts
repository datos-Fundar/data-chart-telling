import type { BasePlotProps, PlotCoreProps } from '$lib/types/plots/props';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { SeriesProps, SingleAxisDataProps } from '$lib/types/plots/data/common';
import type { CurveAwarePlotStylesConfig } from '$lib/types/layout/styles';
import type { AreaStyle } from '$lib/types/plots/styling';

/** `styles` of `DensityPlot`: the curve of the estimate, and the mark that draws it. */
export type DensityPlotStylesConfig = CurveAwarePlotStylesConfig & {
	/** The mark drawing each estimate: a filled `'area'` or a `'line'`. Defaults to `'area'`. */
	mark?: 'area' | 'line';
};

/** `DensityPlot`'s public props. */
export type DensityPlotProps<TData extends Record<string, unknown>> = BasePlotProps<
	SeriesProps<TData> | SingleAxisDataProps<TData>,
	TData,
	DensityPlotStylesConfig,
	AreaStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;

/** What `DensityPlot`'s core draws from. */
export type DensityPlotCoreProps<TData extends Record<string, unknown>> = PlotCoreProps<
	SeriesProps<TData> | SingleAxisDataProps<TData>,
	TData,
	DensityPlotStylesConfig,
	AreaStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;
