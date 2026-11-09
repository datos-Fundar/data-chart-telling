import type { AreaStyle } from '$lib/types/plots/styling';
import type { AxisPlotState, AxisPlotEnv } from '$lib/types/phases';

export type GenericPlotState<TData extends Record<string, unknown>> = AxisPlotState<
	TData,
	AreaStyle
>;

export type GenericPlotEnv = AxisPlotEnv;
