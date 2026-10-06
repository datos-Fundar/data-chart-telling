import type { GapsConfig } from '$lib/types/plots/gaps';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { StrokeStyle, DotStyle } from '$lib/types/plots/styling';
import type { AxisPlotState, AxisPlotCtx } from '$lib/types/layout/phases';

/** LinePlot's pipeline state: the shared axis-based state plus its gaps. */
export type LinePlotState<TData extends Record<string, unknown>> = AxisPlotState<
	TData,
	LineSegmentStyle
> & {
	gaps?: GapsConfig<LineSegmentStyle>;
};

/** The environment every LinePlot phase reads from, alongside the growing state. */
export type LinePlotCtx = AxisPlotCtx & {
	disabledStrokeFor?: (name: string) => StrokeStyle | undefined;
	disabledDotsFor?: (name: string) => DotStyle | undefined;
};
