import type { AreaStyle } from '$lib/types/plots/styling';
import type { AxisPlotState, AxisPlotCtx } from '$lib/types/phases';

/** DensityPlot's pipeline state: the shared axis-based state, with no extras of its own. */
export type DensityPlotState<TData extends Record<string, unknown>> = AxisPlotState<
	TData,
	AreaStyle
>;

/** The environment every DensityPlot phase reads from, alongside the growing state. */
export type DensityPlotCtx = AxisPlotCtx;
