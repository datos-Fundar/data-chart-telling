import type { AxesPlotProps, AxesPlotCoreProps } from '$lib/types/plots/families/axes';
import type { WithValues } from '$lib/types/layout/styles';
import type { PointLabelConfig } from '$lib/types/markers/labels/point';
import type { KindRowContext } from '$lib/types/layout/context';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { SeriesProps, DualAxisDataProps } from '$lib/types/plots/data/common';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import type { AreaStyle } from '$lib/types/plots/styling';

/**
 * One box's summary: its category, its quartiles, the whisker ends (the farthest values within 1.5 IQR of the box),
 * how many values it has and the ones past the whiskers.
 */
export type BoxSummary = {
	category: AxisValue;
	min: number;
	p25: number;
	median: number;
	p75: number;
	max: number;
	count: number;
	outliers: number[];
};

/**
 * What a `BoxPlot` or a `ViolinPlot` knows of a row, which its tooltip's and value labels' `format`, its hover and
 * `usePlot().contextOf` read: the summary of the box (or violin) it is in. A value's own `value` stays its own; a
 * hovered box's is its median.
 */
export type BoxRowContext = KindRowContext<BoxSummary>;

/** The values of a box its value labels can write: its quartiles, its whiskers' ends and the values past them. */
export type BoxValuePart = Exclude<keyof BoxSummary, 'category' | 'count'>;

/** `BoxPlot`'s public props. */
export type BoxPlotProps<TData extends Record<string, unknown>> = AxesPlotProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<AxisBasedStylesConfig, PointLabelConfig, BoxValuePart>,
	AreaStyle,
	BoxRowContext
>;

/** What `BoxPlot`'s core draws from. */
export type BoxPlotCoreProps<TData extends Record<string, unknown>> = AxesPlotCoreProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<AxisBasedStylesConfig, PointLabelConfig, BoxValuePart>,
	AreaStyle
>;
