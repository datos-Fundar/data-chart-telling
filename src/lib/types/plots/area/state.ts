import type { AreaStyle } from '$lib/types/plots/styling';
import type { LegendDisabledStyle } from '$lib/types/layout/legend';
import type { AxisPlotState, AxisPlotCtx, ValueLabelsCtx } from '$lib/types/layout/phases';

/** AreaPlot's pipeline state: the shared axis-based state, with no extras of its own. */
export type AreaPlotState<TData extends Record<string, unknown>> = AxisPlotState<TData, AreaStyle>;

/** The environment every AreaPlot phase reads from, alongside the growing state. */
export type AreaPlotCtx = AxisPlotCtx &
	ValueLabelsCtx & {
		/** A series' legend or hover-isolate dimming, if any. Unset, only the legend's applies. */
		disabledFor?: (name: string) => LegendDisabledStyle | undefined;
	};
