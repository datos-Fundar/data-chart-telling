import { resolvePlotStatistics, expandMarkerStatistics } from '$lib/utils/statistics';
import type { LinePlotState } from '$lib/types/plots/line/state';

/**
 * LinePlot's "statistics" phase: seeds `state.markers` with the top-level
 * `statistics` prop resolved against every resolved series, followed by each
 * author-supplied marker (its own `.statistics` expanded in place) — authored
 * markers render on top of the plot-level ones. The first phase to populate
 * `markers`, which later phases build onto.
 */
export function buildStatistics<TData extends Record<string, unknown>>(
	state: LinePlotState<TData>
): LinePlotState<TData> {
	return {
		...state,
		markers: [
			...resolvePlotStatistics({
				series: state.resolvedSeries ?? [],
				statistics: state.statistics,
				colorFor: state.colorForSeries
			}),
			...expandMarkerStatistics(state.authorMarkers ?? [], state.flat ?? [])
		]
	};
}
