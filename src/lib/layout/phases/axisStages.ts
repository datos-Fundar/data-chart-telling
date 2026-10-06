import { buildData } from '$lib/layout/phases/data';
import { buildMapping } from '$lib/layout/phases/mapping';
import { buildTransforms } from '$lib/layout/phases/transforms';
import { buildStatistics } from '$lib/layout/phases/statistics';
import { buildScales } from '$lib/layout/phases/scales';
import type {
	AxisPlotState,
	AxisPlotCtx,
	AxisPlotKind,
	PhaseStage
} from '$lib/types/layout/phases';

/**
 * Every phase of an axis-based plot, in order: the shared stages, each set up
 * with the plot kind's own options, then the kind's own "markers" phase.
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
		{ phase: 'markers', run: kind.markers }
	];
}
