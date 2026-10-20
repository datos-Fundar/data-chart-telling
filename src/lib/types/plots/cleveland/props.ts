import type { BasePlotProps, PlotCoreProps } from '$lib/types/plots/props';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { SeriesProps, DataProps } from '$lib/types/plots/data/common';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';

/** `ClevelandPlot`'s public props. */
export type ClevelandPlotProps<TData extends Record<string, unknown>> = BasePlotProps<
	SeriesProps<TData> | DataProps<TData>,
	TData,
	AxisBasedStylesConfig,
	LineSegmentStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;

/** What `ClevelandPlot`'s core draws from. */
export type ClevelandPlotCoreProps<TData extends Record<string, unknown>> = PlotCoreProps<
	SeriesProps<TData> | DataProps<TData>,
	TData,
	AxisBasedStylesConfig,
	LineSegmentStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;
