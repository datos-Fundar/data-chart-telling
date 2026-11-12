import type { AxesPlotProps, AxesPlotCoreProps } from '$lib/types/plots/families/axes';
import type { WithValues, BarValueLabel } from '$lib/types/layout/styles';
import type { SeriesProps, DualAxisDataProps } from '$lib/types/plots/data/common';
import type { GapsAwarePlotStylesConfig } from '$lib/types/layout/styles';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';

/** `BarPlot`'s public props. */
export type BarPlotProps<TData extends Record<string, unknown>> = AxesPlotProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<GapsAwarePlotStylesConfig<BarSegmentStyle>, BarValueLabel>,
	BarSegmentStyle
>;

/** What `BarPlot`'s core draws from. */
export type BarPlotCoreProps<TData extends Record<string, unknown>> = AxesPlotCoreProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<GapsAwarePlotStylesConfig<BarSegmentStyle>, BarValueLabel>,
	BarSegmentStyle
>;
