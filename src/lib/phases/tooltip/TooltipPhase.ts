import { TooltipState } from '$lib/layout/tooltip/TooltipState.svelte';
import type { AxisPlotState, PhaseStage } from '$lib/types/phases';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAxisState = AxisPlotState<any, any, any, any>;

/**
 * The "tooltip" phase every axis-based plot shares: how a hovered row reads,
 * as `tooltipFormat` - the same default on every plot, {@link TooltipState.default}.
 * It runs after the scales, which say which axis holds categories.
 */
export class TooltipPhase<TState extends AnyAxisState> implements PhaseStage<TState> {
	readonly phase = 'tooltip' as const;

	run = (state: TState): TState => ({ ...state, tooltipFormat: TooltipState.default(state) });
}
