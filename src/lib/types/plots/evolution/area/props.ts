import type { WithValues, AreaValueLabel } from '$lib/types/layout/styles';
import type { BasePlotProps, PlotCoreProps } from '$lib/types/plots/props';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { SeriesProps, DualAxisDataProps } from '$lib/types/plots/data/common';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import type { AreaStyle } from '$lib/types/plots/styling';

/** `AreaPlot`'s public props. */
export type AreaPlotProps<TData extends Record<string, unknown>> = BasePlotProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<AxisBasedStylesConfig, AreaValueLabel>,
	AreaStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;

/** What `AreaPlot`'s core draws from. */
export type AreaPlotCoreProps<TData extends Record<string, unknown>> = PlotCoreProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<AxisBasedStylesConfig, AreaValueLabel>,
	AreaStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;
