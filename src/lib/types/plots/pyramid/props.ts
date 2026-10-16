import type { BasePlotProps, PlotCoreProps } from '$lib/types/plots/props';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { SeriesProps, DataProps } from '$lib/types/plots/data/common';
import type { GapsAwarePlotStylesConfig } from '$lib/types/layout/styles';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';

/** `PyramidPlot`'s public props. */
export type PyramidPlotProps<TData extends Record<string, unknown>> = BasePlotProps<
	SeriesProps<TData> | DataProps<TData>,
	TData,
	GapsAwarePlotStylesConfig<BarSegmentStyle>,
	BarSegmentStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;

/** What `PyramidPlot`'s core draws from. */
export type PyramidPlotCoreProps<TData extends Record<string, unknown>> = PlotCoreProps<
	SeriesProps<TData> | DataProps<TData>,
	TData,
	GapsAwarePlotStylesConfig<BarSegmentStyle>,
	BarSegmentStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;
