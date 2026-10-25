import type { GapsConfig } from '$lib/types/plots/gaps';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { AxisPlotState, AxisPlotCtx } from '$lib/types/phases';

/** LinePlot's pipeline state: the shared axis-based state plus its gaps. */
export type LinePlotState<TData extends Record<string, unknown>> = AxisPlotState<
	TData,
	LineSegmentStyle
> & {
	gaps?: GapsConfig<LineSegmentStyle>;
};

/** The environment every LinePlot phase reads from, alongside the growing state. */
export type LinePlotCtx = AxisPlotCtx;
