import { buildAxisStages } from '$lib/layout/phases/stages';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import type { AxisPlotState, AxisPlotCtx, AxisPlotKind, PlotPhase } from '$lib/types/layout/phases';

/**
 * One phase of a plot kind's pipeline, as `buildAxisStages` sets it up - so a
 * test can run a single shared stage with that kind's own options. `ctx`
 * defaults to the default configuration with no legend.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stageOf<TState extends AxisPlotState<any, any, any, any>, TCtx extends AxisPlotCtx>(
	kind: AxisPlotKind<TState, TCtx>,
	phase: PlotPhase
): (state: TState, ctx?: TCtx) => TState {
	const stage = buildAxisStages(kind).find((s) => s.phase === phase)!;
	const fallback = { cfg: DEFAULT_CONFIG, legendInteraction: null } as unknown as TCtx;
	return (state, ctx) => stage.run(state, ctx ?? fallback);
}
