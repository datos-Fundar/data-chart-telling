import type { BasePlotProps, PlotCoreProps } from '$lib/types/plots/props';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { SeriesProps, DataProps } from '$lib/types/plots/data/common';
import type { CurveAwarePlotStylesConfig } from '$lib/types/layout/styles';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { AxisChannelName, ChannelAccessors } from '$lib/types/layout/mapping';

/** Flat rows estimated along one axis: `x` for a vertical curve, or `y` alone for a horizontal one. */
type DensityDataProps<TRow extends Record<string, unknown>> = Omit<
	DataProps<TRow>,
	AxisChannelName
> &
	(
		| (Required<Pick<ChannelAccessors<TRow>, 'x'>> & { y?: never })
		| (Required<Pick<ChannelAccessors<TRow>, 'y'>> & { x?: never })
	);

/** `styles` of `DensityPlot`: the curve of the estimate, and the mark that draws it. */
export type DensityPlotStylesConfig = CurveAwarePlotStylesConfig & {
	/** The mark drawing each estimate: a filled `'area'` or a `'line'`. Defaults to `'area'`. */
	mark?: 'area' | 'line';
};

/** `DensityPlot`'s public props. */
export type DensityPlotProps<TData extends Record<string, unknown>> = BasePlotProps<
	SeriesProps<TData> | DensityDataProps<TData>,
	TData,
	DensityPlotStylesConfig,
	AreaStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;

/** What `DensityPlot`'s core draws from. */
export type DensityPlotCoreProps<TData extends Record<string, unknown>> = PlotCoreProps<
	SeriesProps<TData> | DensityDataProps<TData>,
	TData,
	DensityPlotStylesConfig,
	AreaStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;
