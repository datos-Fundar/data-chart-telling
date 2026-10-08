import { buildChannelTooltipFormat } from '$lib/layout/tooltip/format';
import type { AxisPlotState, AxisPlotCtx, TooltipStageOptions } from '$lib/types/layout/phases';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAxisState = AxisPlotState<any, any, any, any>;

/**
 * The "tooltip" stage every axis-based plot shares: how a hovered row reads,
 * as `tooltipFormat` - the kind's own `format`, or `x: y` off the processed
 * channels. It runs last, so a kind's format can read anything placed before it.
 */
export function buildTooltip<TState extends AnyAxisState, TCtx extends AxisPlotCtx>(
	options: TooltipStageOptions<TState, TCtx> = {}
): (state: TState, ctx: TCtx) => TState {
	return (state, ctx) => ({
		...state,
		tooltipFormat: options.format ? options.format(state, ctx) : buildChannelTooltipFormat(state)
	});
}
