import type { AxesPlotProps, AxesPlotCoreProps } from '$lib/types/plots/families/axes';
import type { ChannelAccessors } from '$lib/types/layout/mapping';
import type { Series } from '$lib/types/plots/data/common';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import type { AreaStyle } from '$lib/types/plots/styling';

/** Rows, series or neither, and every channel optional: what markers without their own take. */
export type GenericDataProps<TData extends Record<string, unknown>> = {
	data?: TData[];
	series?: Series<TData>[];
} & ChannelAccessors<TData>;

/** `Plot`'s public props. */
export type GenericPlotProps<TData extends Record<string, unknown>> = AxesPlotProps<
	GenericDataProps<TData>,
	TData,
	AxisBasedStylesConfig,
	AreaStyle
>;

/** What `Plot`'s core draws from. */
export type GenericPlotCoreProps<TData extends Record<string, unknown>> = AxesPlotCoreProps<
	GenericDataProps<TData>,
	TData,
	AxisBasedStylesConfig,
	AreaStyle
>;
