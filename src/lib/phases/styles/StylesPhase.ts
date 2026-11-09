import { ValueLabels } from '$lib/layout/styles/ValueLabels';
import type { AxisPlotState, AxisPlotEnv, PhaseStage } from '$lib/types/phases';
import type { StylesStageOptions } from '$lib/types/phases/styles/phase';

/**
 * The shared "styles" phase: resolves the plot's `styles` against the plot
 * kind's own defaults - its value labels (`valueLabels`), with how far they
 * are expected to reach out, which its margins start from.
 */
export class StylesPhase<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TState extends AxisPlotState<any, any, any, any>,
	TEnv extends AxisPlotEnv
> implements PhaseStage<TState, TEnv> {
	readonly phase = 'styles' as const;
	readonly #options: StylesStageOptions<TState>;

	constructor(options: StylesStageOptions<TState> = {}) {
		this.#options = options;
	}

	run = (state: TState, env: TEnv): TState => ({
		...state,
		valueLabels: ValueLabels.build(state.values, env.cfg, this.#options.values ?? {}, state)
	});
}
