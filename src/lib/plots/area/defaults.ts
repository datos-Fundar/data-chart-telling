import { buildMarks } from '$lib/plots/area/markers';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { AreaPlotState, AreaPlotCtx } from '$lib/types/plots/area/state';

/** AreaPlot on the shared pipeline: areas from a zero baseline, author markers taking the plot's `x`/`y`, and its own markers. Its plot defaults to: hover along x, cumulative timeline tweening `y` per series. */
export function buildAreaDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	AreaPlotState<TData>,
	AreaPlotCtx
> {
	return {
		data: { segments: { color: (style: AreaStyle | undefined) => style?.fill } },
		statistics: { inheritPositions: true },
		scales: { zero: ['y'] },
		styles: {
			values: {
				anchor: 'start',
				format: (v, name) => `${name} - ${v}`,
				reach: (labels, state) => labels.reachAtSeriesEnds(state)
			}
		},
		markers: {
			marks: buildMarks,
			valueLabels: (labels, state) => labels.atSeriesEnds(state)
		},
		timeline: { filterMode: 'upTo', interpolation: { value: 'y', key: ['grouping'] } }
	};
}
