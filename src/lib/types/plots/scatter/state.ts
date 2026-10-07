import type { ScatterSegmentStyle } from '$lib/types/plots/segments/common';
import type { DotStyle } from '$lib/types/plots/styling';
import type { AxisPlotState, AxisPlotCtx, ValueLabelsCtx } from '$lib/types/layout/phases';

/** ScatterPlot's pipeline state: the shared axis-based state, with no extras of its own. */
export type ScatterPlotState<TData extends Record<string, unknown>> = AxisPlotState<
	TData,
	ScatterSegmentStyle
>;

/** The environment every ScatterPlot phase reads from, alongside the growing state. */
export type ScatterPlotCtx = AxisPlotCtx &
	ValueLabelsCtx & {
		disabledDotsFor?: (name: string) => DotStyle | undefined;
	};
