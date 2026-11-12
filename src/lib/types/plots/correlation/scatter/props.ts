import type { AxesPlotProps, AxesPlotCoreProps } from '$lib/types/plots/families/axes';
import type { WithValues, DotValueLabel } from '$lib/types/layout/styles';
import type { SeriesProps, DualAxisDataProps } from '$lib/types/plots/data/common';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import type { ScatterSegmentStyle } from '$lib/types/plots/segments/common';

/** `ScatterPlot`'s public props. */
export type ScatterPlotProps<TData extends Record<string, unknown>> = AxesPlotProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<AxisBasedStylesConfig, DotValueLabel>,
	ScatterSegmentStyle
>;

/** What `ScatterPlot`'s core draws from. */
export type ScatterPlotCoreProps<TData extends Record<string, unknown>> = AxesPlotCoreProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<AxisBasedStylesConfig, DotValueLabel>,
	ScatterSegmentStyle
>;
