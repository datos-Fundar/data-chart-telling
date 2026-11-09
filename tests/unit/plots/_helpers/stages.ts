import { Pipeline } from '$lib/phases/Pipeline';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import type { AxisPlotState, AxisPlotEnv, AxisPlotKind, PlotPhase } from '$lib/types/phases';

/**
 * One phase of a plot kind's pipeline, as `Pipeline.ofAxisKind` sets it up - so a
 * test can run a single shared stage with that kind's own options. `env`
 * defaults to the default configuration with no legend.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stageOf<TState extends AxisPlotState<any, any, any, any>, TEnv extends AxisPlotEnv>(
	kind: AxisPlotKind<TState, TEnv>,
	phase: PlotPhase
): (state: TState, env?: TEnv) => TState {
	const stage = Pipeline.ofAxisKind(kind).stage(phase)!;
	const fallback = { cfg: DEFAULT_CONFIG } as unknown as TEnv;
	return (state, env) => stage.run(state, env ?? fallback);
}

/**
 * Every stage of `pipeline` over `state` as it is - for a test that builds
 * the state itself, where `Pipeline.run` would seed it from a core's props.
 */
export function runStages<TState, TEnv>(
	pipeline: Pipeline<TState, TEnv>,
	state: TState,
	env: TEnv
): TState {
	return pipeline.stages.reduce((acc, stage) => stage.run(acc, env), state);
}
