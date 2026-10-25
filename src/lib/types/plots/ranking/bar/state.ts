import type { AxisPlotState, AxisPlotCtx } from '$lib/types/phases';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';

/** BarPlot's pipeline state: the shared axis-based state. */
export type BarPlotState<TData extends Record<string, unknown>> = AxisPlotState<
	TData,
	BarSegmentStyle
>;

/** The environment every BarPlot phase reads from, alongside the growing state. */
export type BarPlotCtx = AxisPlotCtx;
