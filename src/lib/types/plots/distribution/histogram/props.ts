import type { AxesPlotProps, AxesPlotCoreProps } from '$lib/types/plots/families/axes';
import type { WithValues, CellValueLabel } from '$lib/types/layout/styles';
import type { KindRowContext } from '$lib/types/layout/context';
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
export type HistogramPlotProps<TData extends Record<string, unknown>> = AxesPlotProps<
	SeriesProps<TData> | SingleAxisDataProps<TData>,
	TData,
	WithValues<AxisBasedStylesConfig, CellValueLabel>,
	AreaStyle,
	HistogramRowContext
>;

/** What `HistogramPlot`'s core draws from. */
export type HistogramPlotCoreProps<TData extends Record<string, unknown>> = AxesPlotCoreProps<
	SeriesProps<TData> | SingleAxisDataProps<TData>,
	TData,
	WithValues<AxisBasedStylesConfig, CellValueLabel>,
	AreaStyle
>;
