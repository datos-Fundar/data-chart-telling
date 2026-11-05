import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { AxisPlotState, AxisPlotCtx } from '$lib/types/phases';

/** TreemapPlot's pipeline state: the shared axis-based state, over a unit square its tiles are laid out in. */
export type TreemapPlotState<TData extends Record<string, unknown>> = AxisPlotState<
	TData,
	BarSegmentStyle
>;

/** The environment every TreemapPlot phase reads from, alongside the growing state. */
export type TreemapPlotCtx = AxisPlotCtx;
