import type { AxesPlotProps, AxesPlotCoreProps } from '$lib/types/plots/families/axes';
import type { WithValues, CellValueLabel } from '$lib/types/layout/styles';
import type { SeriesProps, DualAxisDataProps } from '$lib/types/plots/data/common';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import type { CellSegmentStyle } from '$lib/types/plots/segments/common';

/** `HeatmapPlot`'s public props. */
export type HeatmapPlotProps<TData extends Record<string, unknown>> = AxesPlotProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<AxisBasedStylesConfig, CellValueLabel>,
	CellSegmentStyle
>;

/** What `HeatmapPlot`'s core draws from. */
export type HeatmapPlotCoreProps<TData extends Record<string, unknown>> = AxesPlotCoreProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<AxisBasedStylesConfig, CellValueLabel>,
	CellSegmentStyle
>;
