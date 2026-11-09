import { TooltipState } from '$lib/layout/tooltip/TooltipState.svelte';
import { RowContext } from '$lib/phases/context/RowContext';
import { NumberFormat } from '$lib/utils/NumberFormat';
import type { AxisPlotEnv, AxisPlotState, PhaseStage, ProcessedRow } from '$lib/types/phases';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAxisState = AxisPlotState<any, any, any, any>;

/**
 * The "tooltip" phase every axis-based plot shares: how a hovered row reads,
 * as `tooltipFormat` - the same default on every plot, {@link TooltipState.default} -
 * and the order its rows read in, as `tooltipSort`: highest value first, by
 * the value each row's context gives it (a stacked row's own, not its running total). The value reads as the tooltip's
 * `decimals`, `prefix`, `suffix` and `signDisplay` ask. It
 * runs after the scales, which say which axis holds categories.
 */
export class TooltipPhase<TState extends AnyAxisState> implements PhaseStage<TState, AxisPlotEnv> {
	readonly phase = 'tooltip' as const;

	run = (state: TState, env: AxisPlotEnv): TState => {
		const contextOf = RowContext.reader(state);
		return {
			...state,
			tooltipFormat: TooltipState.default(
				state,
				NumberFormat.maybe(NumberFormat.displayOf(state.tooltip), env.cfg)
			),
			tooltipSort: TooltipState.descending((row: ProcessedRow) => contextOf(row).value)
		};
	};
}
