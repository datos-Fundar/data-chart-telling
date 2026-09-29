import type { PlotPhase, PhaseStage } from '$lib/types/layout/phases';

/** Canonical execution order of every {@link PlotPhase}. */
export const PHASE_ORDER: readonly PlotPhase[] = [
	'data',
	'mapping',
	'statistics',
	'scales',
	'markers',
	'coordinates',
	'facet'
];

/** Runs `stages` against `state`, ordered by {@link PHASE_ORDER}. */
export function runStages<TState, TCtx = unknown>(
	stages: PhaseStage<TState, TCtx>[],
	state: TState,
	ctx: TCtx
): TState {
	const rank = (phase: PlotPhase) => PHASE_ORDER.indexOf(phase);
	return [...stages]
		.sort((a, b) => rank(a.phase) - rank(b.phase))
		.reduce((acc, stage) => stage.run(acc, ctx), state);
}
