import type { AxisPlotState, AxisPlotCtx } from '$lib/types/phases';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';

/** LollipopPlot's pipeline state: the shared axis-based state, with no extras of its own. */
export type LollipopPlotState<TData extends Record<string, unknown>> = AxisPlotState<
	TData,
	LineSegmentStyle
>;

/** The environment every LollipopPlot phase reads from, alongside the growing state. */
export type LollipopPlotCtx = AxisPlotCtx;
