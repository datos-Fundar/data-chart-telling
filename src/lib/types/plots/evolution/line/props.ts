import type { WithValues, LineValueLabel } from '$lib/types/layout/styles';
import type { BasePlotProps, PlotCoreProps } from '$lib/types/plots/props';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { SeriesProps, DualAxisDataProps } from '$lib/types/plots/data/common';
import type {
	CurveAwarePlotStylesConfig,
	GapsAwarePlotStylesConfig
} from '$lib/types/layout/styles';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';

/** `LinePlot`'s public props. */
export type LinePlotProps<TData extends Record<string, unknown>> = BasePlotProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<
		GapsAwarePlotStylesConfig<LineSegmentStyle> & CurveAwarePlotStylesConfig,
		LineValueLabel
	>,
	LineSegmentStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;

/** What `LinePlot`'s core draws from. */
export type LinePlotCoreProps<TData extends Record<string, unknown>> = PlotCoreProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<
		GapsAwarePlotStylesConfig<LineSegmentStyle> & CurveAwarePlotStylesConfig,
		LineValueLabel
	>,
	LineSegmentStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;
