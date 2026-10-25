import type {
	AxisPlotCtx,
	AxisPlotState,
	MarkersStageOptions,
	PhaseStage
} from '$lib/types/phases';
import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

/**
 * The shared "markers" phase: everything the plot draws, bottom to top - the
 * plot kind's own marks, then what the "statistics" phase left in
 * `state.markers` (the author's markers and the plot's statistics), then its
 * value labels when `styles.values.show` turns them on, each with what every
 * label shares ({@link ValueLabels.hooks}).
 */
export class MarkersPhase<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TState extends AxisPlotState<any, any, any, any>,
	TCtx extends AxisPlotCtx
> implements PhaseStage<TState, TCtx> {
	readonly phase = 'markers' as const;
	readonly #options: MarkersStageOptions<TState, TCtx>;

	constructor(options: MarkersStageOptions<TState, TCtx>) {
		this.#options = options;
	}

	run = (state: TState, ctx: TCtx): TState => {
		const options = this.#options;
		const labels = state.valueLabels;
		const valueLabels: AxisBasedMarkersConfig[] =
			labels?.show && options.valueLabels
				? options
						.valueLabels(labels, state, ctx)
						.map((marker) => ({ ...labels.hooks(ctx), ...marker }))
				: [];
		return {
			...state,
			markers: MarkerChannels.inheritPosition(
				MarkerChannels.inheritAll(
					[...options.marks(state, ctx), ...(state.markers ?? []), ...valueLabels],
					state.scales as never
				),
				state.processedData
			)
		};
	};
}
