import { Pipeline } from '$lib/phases/Pipeline';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import type { AxisPlotState, AxisPlotCtx, AxisPlotKind, PlotPhase } from '$lib/types/phases';

/**
 * One phase of a plot kind's pipeline, as `Pipeline.ofAxisKind` sets it up - so a
 * test can run a single shared stage with that kind's own options. `ctx`
 * defaults to the default configuration with no legend.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stageOf<TState extends AxisPlotState<any, any, any, any>, TCtx extends AxisPlotCtx>(
	kind: AxisPlotKind<TState, TCtx>,
	phase: PlotPhase
): (state: TState, ctx?: TCtx) => TState {
	const stage = Pipeline.ofAxisKind(kind).stage(phase)!;
	const fallback = { cfg: DEFAULT_CONFIG } as unknown as TCtx;
	return (state, ctx) => stage.run(state, ctx ?? fallback);
}

/**
 * Every stage of `pipeline` over `state` as it is - for a test that builds
 * the state itself, where `Pipeline.run` would seed it from a core's props.
 */
export function runStages<TState, TCtx>(
	pipeline: Pipeline<TState, TCtx>,
	state: TState,
	ctx: TCtx
): TState {
	return pipeline.stages.reduce((acc, stage) => stage.run(acc, ctx), state);
}
