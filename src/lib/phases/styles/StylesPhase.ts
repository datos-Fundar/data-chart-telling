import { ValueLabels } from '$lib/layout/styles/ValueLabels';
import type { AxisPlotState, AxisPlotCtx, PhaseStage } from '$lib/types/phases';
import type { StylesStageOptions } from '$lib/types/phases/styles/phase';

/**
 * The shared "styles" phase: resolves the plot's `styles` against the plot
 * kind's own defaults - its value labels (`valueLabels`), with how far they
 * are expected to reach out, which its margins start from.
 */
export class StylesPhase<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TState extends AxisPlotState<any, any, any, any>,
	TCtx extends AxisPlotCtx
> implements PhaseStage<TState, TCtx> {
	readonly phase = 'styles' as const;
	readonly #options: StylesStageOptions<TState>;

	constructor(options: StylesStageOptions<TState> = {}) {
		this.#options = options;
	}

	run = (state: TState, ctx: TCtx): TState => ({
		...state,
		valueLabels: ValueLabels.build(state.values, ctx.cfg, this.#options.values ?? {}, state)
	});
}
