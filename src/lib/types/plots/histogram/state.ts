import type { AreaStyle } from '$lib/types/plots/styling';
import type { AxisPlotState, AxisPlotCtx, ValueLabelsCtx } from '$lib/types/layout/phases';

/** HistogramPlot's pipeline state: the shared axis-based state, with no extras of its own. */
export type HistogramPlotState<TData extends Record<string, unknown>> = AxisPlotState<
	TData,
	AreaStyle
>;

/** The environment every HistogramPlot phase reads from, alongside the growing state. */
export type HistogramPlotCtx = AxisPlotCtx & ValueLabelsCtx;
