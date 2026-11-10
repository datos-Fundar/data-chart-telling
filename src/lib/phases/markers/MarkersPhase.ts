import type {
	AxisPlotEnv,
	AxisPlotState,
	MarkersStageOptions,
	PhaseStage
} from '$lib/types/phases';
import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
import { MarkerStyles } from '$lib/phases/markers/MarkerStyles';
import { MarkerLabels } from '$lib/markers/labels/MarkerLabels';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

/**
 * The shared "markers" phase: everything the plot draws, bottom to top - the
 * plot kind's own marks, then what the "statistics" phase left in
 * `state.markers` (the author's markers and the plot's statistics), then the
 * `'point'` labels of all of them, and every style as svelteplot reads it ({@link MarkerStyles}).
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
		const rows = state.processedData?.data;
		const positioned = MarkerChannels.inheritPosition(
			MarkerChannels.inheritAll(
				[...options.marks(state, env), ...(state.markers ?? [])],
				state.scales as never
			),
			state.processedData
		);
		// Point labels draw last, merged across markers so they declutter together.
		const { markers, labels: pointLabels } = MarkerLabels.extractPoints(positioned, {
			rows,
			valueAxis: PlotAxes.valueOf(state) as 'x' | 'y',
			isHorizontal: state.axes?.isHorizontal,
			gap: env.cfg.text?.label.gap
		});
		return {
			...state,
			markers: MarkerStyles.resolveAll([...markers, ...(pointLabels as AxisBasedMarkersConfig[])], {
				cfg: env.cfg,
				rows
			})
		};
	};
}
