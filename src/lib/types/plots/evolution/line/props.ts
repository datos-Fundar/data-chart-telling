import type { AxesPlotProps, AxesPlotCoreProps } from '$lib/types/plots/families/axes';
import type { WithValues, LineValueLabel } from '$lib/types/layout/styles';
import type { SeriesProps, DualAxisDataProps } from '$lib/types/plots/data/common';
import type {
	CurveAwarePlotStylesConfig,
	GapsAwarePlotStylesConfig
} from '$lib/types/layout/styles';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';

/** `LinePlot`'s public props. */
export type LinePlotProps<TData extends Record<string, unknown>> = AxesPlotProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<
		GapsAwarePlotStylesConfig<LineSegmentStyle> & CurveAwarePlotStylesConfig,
		LineValueLabel
	>,
	LineSegmentStyle
>;

/** What `LinePlot`'s core draws from. */
export type LinePlotCoreProps<TData extends Record<string, unknown>> = AxesPlotCoreProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<
		GapsAwarePlotStylesConfig<LineSegmentStyle> & CurveAwarePlotStylesConfig,
		LineValueLabel
	>,
	LineSegmentStyle
>;
