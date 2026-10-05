import { prepareAuthorMarkers } from '$lib/utils/authorMarkers';
import { resolvePlotStatistics, expandMarkerStatistics } from '$lib/utils/statistics';
import type { LinePlotState } from '$lib/types/plots/line/state';

/**
 * The color an unscoped marker inherits on a LinePlot: the line's own stroke
 * when its first segment restyles it (a segment's `stroke` overrides the
 * series color), otherwise the first series' default color.
 */
function lineDefaultColor<TData extends Record<string, unknown>>(
	state: LinePlotState<TData>
): string | undefined {
	const segmentStroke = state.groupedSeries?.[0]?.visualSegments?.[0]?.styles?.stroke?.stroke;
	if (typeof segmentStroke === 'string') return segmentStroke;
	return state.resolvedSeries?.[0] && state.colorForSeries?.(state.resolvedSeries[0].name);
}

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
			...expandMarkerStatistics(
				prepareAuthorMarkers(state.authorMarkers ?? [], {
					...state,
					flat: state.flat ?? [],
					defaultColor: lineDefaultColor(state)
				}),
				state.flat ?? []
			)
		]
	};
}
