import type { BasePlotProps, PlotCoreProps } from '$lib/types/plots/props';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
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
export type GenericPlotProps<TData extends Record<string, unknown>> = BasePlotProps<
	GenericDataProps<TData>,
	TData,
	AxisBasedStylesConfig,
	AreaStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;

/** What `Plot`'s core draws from. */
export type GenericPlotCoreProps<TData extends Record<string, unknown>> = PlotCoreProps<
	GenericDataProps<TData>,
	TData,
	AxisBasedStylesConfig,
	AreaStyle,
	AxisBasedMarkersConfig,
	AxisBasedScalesConfig<TData>
>;
