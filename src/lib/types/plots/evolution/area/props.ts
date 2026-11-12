import type { AxesPlotProps, AxesPlotCoreProps } from '$lib/types/plots/families/axes';
import type { WithValues, AreaValueLabel } from '$lib/types/layout/styles';
import type { SeriesProps, DualAxisDataProps } from '$lib/types/plots/data/common';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import type { AreaStyle } from '$lib/types/plots/styling';

/** `AreaPlot`'s public props. */
export type AreaPlotProps<TData extends Record<string, unknown>> = AxesPlotProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<AxisBasedStylesConfig, AreaValueLabel>,
	AreaStyle
>;

/** What `AreaPlot`'s core draws from. */
export type AreaPlotCoreProps<TData extends Record<string, unknown>> = AxesPlotCoreProps<
	SeriesProps<TData> | DualAxisDataProps<TData>,
	TData,
	WithValues<AxisBasedStylesConfig, AreaValueLabel>,
	AreaStyle
>;
