import type { AxesPlotProps, AxesPlotCoreProps } from '$lib/types/plots/families/axes';
import type { WithValues, BarValueLabel } from '$lib/types/layout/styles';
import type { SeriesProps, DualAxisDataProps } from '$lib/types/plots/data/common';
import type { GapsAwarePlotStylesConfig } from '$lib/types/layout/styles';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';

/** `PyramidPlot`'s public props. */
export type PyramidPlotProps<TData extends Record<string, unknown>> = AxesPlotProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<GapsAwarePlotStylesConfig<BarSegmentStyle>, BarValueLabel>,
	BarSegmentStyle
>;

/** What `PyramidPlot`'s core draws from. */
export type PyramidPlotCoreProps<TData extends Record<string, unknown>> = AxesPlotCoreProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<GapsAwarePlotStylesConfig<BarSegmentStyle>, BarValueLabel>,
	BarSegmentStyle
>;
