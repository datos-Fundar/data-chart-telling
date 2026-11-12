import type { AxesPlotProps, AxesPlotCoreProps } from '$lib/types/plots/families/axes';
import type { AreaValueLabel, LineValueLabel, WithValues } from '$lib/types/layout/styles';
import type { SeriesProps, SingleAxisDataProps } from '$lib/types/plots/data/common';
import type { CurveAwarePlotStylesConfig } from '$lib/types/layout/styles';
import type { AreaStyle } from '$lib/types/plots/styling';

/** `styles` of `DensityPlot`: the curve of the estimate, and the mark that draws it. */
export type DensityPlotStylesConfig = WithValues<
	CurveAwarePlotStylesConfig,
	AreaValueLabel | LineValueLabel
> & {
	/** The mark drawing each estimate: a filled `'area'` or a `'line'`. Defaults to `'area'`. */
	mark?: 'area' | 'line';
};

/** `DensityPlot`'s public props. */
export type DensityPlotProps<TData extends Record<string, unknown>> = AxesPlotProps<
	SeriesProps<TData> | SingleAxisDataProps<TData>,
	TData,
	DensityPlotStylesConfig,
	AreaStyle
>;

/** What `DensityPlot`'s core draws from. */
export type DensityPlotCoreProps<TData extends Record<string, unknown>> = AxesPlotCoreProps<
	SeriesProps<TData> | SingleAxisDataProps<TData>,
	TData,
	DensityPlotStylesConfig,
	AreaStyle
>;
