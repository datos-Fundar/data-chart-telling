import type { BasePlotProps, PlotCoreProps } from '$lib/types/plots/props';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { SeriesProps, DataProps } from '$lib/types/plots/data/common';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { ChannelAccessors } from '$lib/types/layout/mapping';

/** Flat rows binned on `x`. `y` is optional: a bin's count is its height. */
type HistogramDataProps<TRow extends Record<string, unknown>> = Omit<DataProps<TRow>, 'y'> &
	Pick<ChannelAccessors<TRow>, 'y'>;

/** `HistogramPlot`'s public props. */
export type HistogramPlotProps<TData extends Record<string, unknown>> = BasePlotProps<
	SeriesProps<TData> | HistogramDataProps<TData>,
	TData,
	AxisBasedStylesConfig,
	AreaStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;

/** What `HistogramPlot`'s core draws from. */
export type HistogramPlotCoreProps<TData extends Record<string, unknown>> = PlotCoreProps<
	SeriesProps<TData> | HistogramDataProps<TData>,
	TData,
	AxisBasedStylesConfig,
	AreaStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;
