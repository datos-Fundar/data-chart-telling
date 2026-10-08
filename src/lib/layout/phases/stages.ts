import { buildData } from '$lib/layout/phases/data';
import { buildMapping } from '$lib/layout/phases/mapping';
import { buildTransforms } from '$lib/layout/phases/transforms';
import { buildStatistics } from '$lib/layout/phases/statistics';
import { buildScales } from '$lib/layout/phases/scales';
import { buildTooltip } from '$lib/layout/phases/tooltip';
import type {
	AxisPlotState,
	AxisPlotCtx,
	AxisPlotKind,
	PhaseStage,
	PlotPhase
} from '$lib/types/layout/phases';

/** Canonical execution order of every {@link PlotPhase}. */
export const PHASE_ORDER: readonly PlotPhase[] = [
	'data',
	'mapping',
	'transforms',
	'statistics',
	'scales',
	'markers',
	'coordinates',
	'tooltip',
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

/**
 * Every phase of an axis-based plot, in order: the shared stages, each set up
 * with the plot kind's own options, the kind's own "markers" phase, then the
 * "tooltip" phase over all of it.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function buildAxisStages<
	TState extends AxisPlotState<any, any, any, any>,
	TCtx extends AxisPlotCtx
>(kind: AxisPlotKind<TState, TCtx>): PhaseStage<TState, TCtx>[] {
	/* eslint-enable @typescript-eslint/no-explicit-any */
	return [
		{ phase: 'data', run: buildData<TState, TCtx>(kind.data) },
		{ phase: 'mapping', run: buildMapping<TState, TCtx>(kind.mapping) },
		{ phase: 'transforms', run: buildTransforms<TState, TCtx>(kind.transforms) },
		{ phase: 'statistics', run: buildStatistics<TState>(kind.statistics) },
		{ phase: 'scales', run: buildScales<TState, TCtx>(kind.scales) },
		{ phase: 'markers', run: kind.markers },
		{ phase: 'tooltip', run: buildTooltip<TState, TCtx>(kind.tooltip) }
	];
}
