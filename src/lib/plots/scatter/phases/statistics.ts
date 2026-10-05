import { prepareAuthorMarkers } from '$lib/utils/authorMarkers';
import { resolvePlotStatistics, expandMarkerStatistics } from '$lib/utils/statistics';
import type { ScatterPlotState } from '$lib/types/plots/scatter/state';

/**
 * ScatterPlot's "statistics" phase: seeds `state.markers` with the top-level
 * `statistics` prop resolved against every resolved series, followed by each
 * author-supplied marker (its own `.statistics` expanded in place) — authored
 * markers render on top of the plot-level ones. The first phase to populate
 * `markers`, which later phases build onto.
 */
export function buildStatistics<TData extends Record<string, unknown>>(
	state: ScatterPlotState<TData>
): ScatterPlotState<TData> {
	return {
		...state,
		markers: [
			...resolvePlotStatistics({
				series: state.resolvedSeries ?? [],
				statistics: state.statistics,
				colorFor: state.colorForSeries
			}),
			...expandMarkerStatistics(
				prepareAuthorMarkers(state.authorMarkers ?? [], {
					...state,
					flat: state.flat ?? [],
					defaultColor:
						state.resolvedSeries?.[0] && state.colorForSeries?.(state.resolvedSeries[0].name)
				}),
				state.flat ?? []
			)
		]
	};
}
