import type { AreaStyle } from '$lib/types/plots/styling';
import type { AxisPlotState, AxisPlotCtx } from '$lib/types/phases';

/** RaincloudPlot's pipeline state: the shared axis-based state, with no extras of its own. */
export type RaincloudPlotState<TData extends Record<string, unknown>> = AxisPlotState<
	TData,
	AreaStyle
>;

/** The environment every RaincloudPlot phase reads from, alongside the growing state. */
export type RaincloudPlotCtx = AxisPlotCtx;
