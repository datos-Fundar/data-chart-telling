import type { Series } from '$lib/types/plots/data/common';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { AxisPlotState, AxisPlotCtx } from '$lib/types/phases';

export type PyramidSide = 'left' | 'right';

/** A resolved series tagged with which side of the shared zero baseline it renders on. */
export type PyramidSeries<TData extends Record<string, unknown>> = Series<TData> & {
	side: PyramidSide;
};

/**
 * PyramidPlot's pipeline state: the shared axis-based state with its own series
 * and row shapes. Its `x`/`y` are the visual axes, as on every plot: the one
 * holding categories decides whether its sides run left/right or bottom/top.
 */
export type PyramidPlotState<TData extends Record<string, unknown>> = AxisPlotState<
	TData,
	BarSegmentStyle,
	PyramidSeries<TData>
>;

/** The environment every PyramidPlot phase reads from, alongside the growing state. */
export type PyramidPlotCtx = AxisPlotCtx;
