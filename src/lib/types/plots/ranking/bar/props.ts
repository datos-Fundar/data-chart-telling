import type { WithValues, BarValueLabel } from '$lib/types/layout/styles';
import type { BasePlotProps, PlotCoreProps } from '$lib/types/plots/props';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { SeriesProps, DualAxisDataProps } from '$lib/types/plots/data/common';
import type { GapsAwarePlotStylesConfig } from '$lib/types/layout/styles';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';

/** `BarPlot`'s public props. */
export type BarPlotProps<TData extends Record<string, unknown>> = BasePlotProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<GapsAwarePlotStylesConfig<BarSegmentStyle>, BarValueLabel>,
	BarSegmentStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;

/** What `BarPlot`'s core draws from. */
export type BarPlotCoreProps<TData extends Record<string, unknown>> = PlotCoreProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<GapsAwarePlotStylesConfig<BarSegmentStyle>, BarValueLabel>,
	BarSegmentStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;
