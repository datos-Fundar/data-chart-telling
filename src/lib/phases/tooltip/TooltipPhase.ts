import { TooltipState } from '$lib/layout/tooltip/TooltipState.svelte';
import { ValueLabels } from '$lib/layout/styles/ValueLabels';
import { NumberFormat } from '$lib/utils/NumberFormat';
import type { AxisPlotCtx, AxisPlotState, PhaseStage } from '$lib/types/phases';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAxisState = AxisPlotState<any, any, any, any>;

/**
 * The "tooltip" phase every axis-based plot shares: how a hovered row reads,
 * as `tooltipFormat` - the same default on every plot, {@link TooltipState.default} -
 * and the order its rows read in, as `tooltipSort`: highest value first, by
 * each row's own value (a stacked row's share, not its running total). The value reads as the tooltip's
 * `decimals`, `prefix`, `suffix` and `signDisplay` ask. It
 * runs after the scales, which say which axis holds categories.
 */
export class TooltipPhase<TState extends AnyAxisState> implements PhaseStage<TState, AxisPlotCtx> {
	readonly phase = 'tooltip' as const;

	run = (state: TState, ctx: AxisPlotCtx): TState => ({
		...state,
		tooltipFormat: TooltipState.default(
			state,
			NumberFormat.maybe(NumberFormat.displayOf(state.tooltip), ctx.cfg)
		),
		tooltipSort: TooltipState.descending(ValueLabels.valueOf(state))
	});
}
