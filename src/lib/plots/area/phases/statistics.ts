import { resolvePlotStatistics, expandMarkerStatistics } from '$lib/utils/statistics';
import { prepareAuthorMarkers } from '$lib/utils/authorMarkers';
import type { AreaPlotState } from '$lib/types/plots/area/state';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

/** Marker kinds that draw from a channel pair, so they need a default `x`/`y` when the author leaves one out. */
const POSITIONED_KINDS = new Set(['line', 'area', 'dot']);

/**
 * AreaPlot's "statistics" phase: the first to populate `markers` — statistics
 * over each series, then the author's own markers. It runs ahead of "scales"
 * so the domain can cover what they draw; "markers" prepends the default areas. An author marker of a positioned kind
 * that sets no `x`/`y` inherits the plot's own, the way the default areas do.
 */
export function buildStatistics<TData extends Record<string, unknown>>(
	state: AreaPlotState<TData>
): AreaPlotState<TData> {
	const { resolvedSeries = [], colorForSeries, flat = [], grouping, color } = state;
	const plot = {
		grouping,
		color,
		defaultColor: resolvedSeries[0] && colorForSeries?.(resolvedSeries[0].name),
		colorForSeries,
		flat,
		resolvedSeries
	};

	const channelDefaults = {
		x: resolvedSeries[0]?.x ?? state.x,
		y: resolvedSeries[0]?.y ?? state.y
	};
	const authorMarkers = state.authorMarkers.map((marker) => {
		if (!POSITIONED_KINDS.has(marker.type)) return marker;
		const positioned = marker as AxisBasedMarkersConfig & { x?: unknown; y?: unknown };
		return {
			...positioned,
			x: positioned.x ?? channelDefaults.x,
			y: positioned.y ?? channelDefaults.y
		} as AxisBasedMarkersConfig;
	});

	const markers: AxisBasedMarkersConfig[] = [
		...resolvePlotStatistics({
			series: resolvedSeries,
			statistics: state.statistics,
			colorFor: colorForSeries
		}),
		...expandMarkerStatistics(prepareAuthorMarkers(authorMarkers, plot), flat)
	];

	return { ...state, markers };
}
