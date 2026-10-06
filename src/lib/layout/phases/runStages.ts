import type { PlotPhase, PhaseStage } from '$lib/types/layout/phases';

/** Canonical execution order of every {@link PlotPhase}. */
export const PHASE_ORDER: readonly PlotPhase[] = [
	'data',
	'mapping',
	'transforms',
	'statistics',
	'scales',
	'markers',
	'coordinates',
	'facet'
];

/**
 * Runs `stages` against `state`, ordered by {@link PHASE_ORDER}. Stages
 * declared out of that order still run in it, with a warning, since the
 * declared order would otherwise read as the one that runs.
 */
export function runStages<TState, TCtx = unknown>(
	stages: PhaseStage<TState, TCtx>[],
	state: TState,
	ctx: TCtx
): TState {
	const rank = (phase: PlotPhase) => PHASE_ORDER.indexOf(phase);
	const ordered = [...stages].sort((a, b) => rank(a.phase) - rank(b.phase));
	if (ordered.some((stage, i) => stage !== stages[i])) {
		console.warn(
			`runStages: stages declared as [${stages.map((s) => s.phase).join(', ')}] run in phase order: [${ordered.map((s) => s.phase).join(', ')}].`
		);
	}
	return ordered.reduce((acc, stage) => stage.run(acc, ctx), state);
}
