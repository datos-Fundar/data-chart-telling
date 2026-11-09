import type {
	AxisPlotEnv,
	AxisPlotState,
	MarkersStageOptions,
	PhaseStage
} from '$lib/types/phases';
import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
import { MarkerStyles } from '$lib/phases/markers/MarkerStyles';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

/**
 * The shared "markers" phase: everything the plot draws, bottom to top - the
 * plot kind's own marks, then what the "statistics" phase left in
 * `state.markers` (the author's markers and the plot's statistics), then its
 * value labels when `styles.values.show` turns them on, each with what every
 * label shares ({@link ValueLabels.hooks}), and every style as svelteplot reads it ({@link MarkerStyles}).
 */
export class MarkersPhase<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TState extends AxisPlotState<any, any, any, any>,
	TEnv extends AxisPlotEnv
> implements PhaseStage<TState, TEnv> {
	readonly phase = 'markers' as const;
	readonly #options: MarkersStageOptions<TState, TEnv>;

	constructor(options: MarkersStageOptions<TState, TEnv>) {
		this.#options = options;
	}

	run = (state: TState, env: TEnv): TState => {
		const options = this.#options;
		const labels = state.valueLabels;
		const valueLabels: AxisBasedMarkersConfig[] =
			labels?.show && options.valueLabels
				? options.valueLabels(labels, state, env).map((marker): AxisBasedMarkersConfig => {
						const { styles, ...hooks } = labels.hooks(env);
						return { ...hooks, ...marker, styles: { ...styles, ...marker.styles } } as never;
					})
				: [];
		return {
			...state,
			markers: MarkerStyles.resolveAll(
				MarkerChannels.inheritPosition(
					MarkerChannels.inheritAll(
						[...options.marks(state, env), ...(state.markers ?? []), ...valueLabels],
						state.scales as never
					),
					state.processedData
				),
				{ cfg: env.cfg, rows: state.processedData?.data }
			)
		};
	};
}
