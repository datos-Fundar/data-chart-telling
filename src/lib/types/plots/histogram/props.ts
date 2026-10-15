import type { BasePlotProps, PlotCoreProps } from '$lib/types/plots/props';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { SeriesProps, DataProps } from '$lib/types/plots/data/common';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { AxisChannelName, ChannelAccessors } from '$lib/types/layout/mapping';

/** Flat rows binned on one axis: `x` for vertical bars, or `y` alone for horizontal ones. A bin's count is its length. */
type HistogramDataProps<TRow extends Record<string, unknown>> = Omit<
	DataProps<TRow>,
	AxisChannelName
> &
	(
		| (Required<Pick<ChannelAccessors<TRow>, 'x'>> & { y?: never })
		| (Required<Pick<ChannelAccessors<TRow>, 'y'>> & { x?: never })
	);

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
