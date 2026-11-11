import type { WithValues, CellValueLabel } from '$lib/types/layout/styles';
import type { KindRowContext } from '$lib/types/layout/context';
import type { BasePlotProps, PlotCoreProps } from '$lib/types/plots/props';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { SeriesProps, SingleAxisDataProps } from '$lib/types/plots/data/common';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import type { AreaStyle } from '$lib/types/plots/styling';

/**
 * What a `HistogramPlot` knows of a bin, which its tooltip's and value labels' `format`, its hover and
 * `usePlot().contextOf` read: its `count` (also its `value`) and the edges it spans.
 */
export type HistogramRowContext = KindRowContext<{
	/** How many values fall in the bin. */
	count: number;
	/** The bin's lower edge. */
	from: number;
	/** The bin's upper edge. */
	to: number;
}>;

/** `HistogramPlot`'s public props. */
export type HistogramPlotProps<TData extends Record<string, unknown>> = BasePlotProps<
	SeriesProps<TData> | SingleAxisDataProps<TData>,
	TData,
	WithValues<AxisBasedStylesConfig, CellValueLabel>,
	AreaStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>,
	undefined,
	HistogramRowContext
>;

/** What `HistogramPlot`'s core draws from. */
export type HistogramPlotCoreProps<TData extends Record<string, unknown>> = PlotCoreProps<
	SeriesProps<TData> | SingleAxisDataProps<TData>,
	TData,
	WithValues<AxisBasedStylesConfig, CellValueLabel>,
	AreaStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;
