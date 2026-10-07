import { prepareAuthorMarkers, withProcessedRows } from '$lib/utils/authorMarkers';
import { resolvePlotStatistics, expandMarkerStatistics } from '$lib/utils/statistics';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { StatisticsStageOptions, StatisticsStageState } from '$lib/types/layout/phases';

/** Marker kinds that draw from a channel pair, so they take the plot's `x`/`y` when the author leaves one out. */
const POSITIONED_KINDS = new Set(['line', 'area', 'dot']);

/**
 * The "statistics" stage every axis-based plot shares: seeds `state.markers`
 * with the plot-level `statistics` resolved against every series, followed by
 * the author's own markers, each one inheriting the plot's grouping and color,
 * drawing the plot's processed rows when it has none of its own (see
 * `withProcessedRows`), running its own `transforms`, and expanding its own
 * `.statistics` in place.
 * Authored markers render on top of the plot-level ones. Later phases build
 * onto `state.markers`.
 */
export function buildStatistics<TState extends StatisticsStageState>(
	options: StatisticsStageOptions<TState> = {}
): (state: TState) => TState {
	return (state) => {
		const {
			resolvedSeries = [],
			flat = [],
			colorForSeries,
			statistics,
			authorMarkers = []
		} = state;
		const { inheritGrouping = true, inheritPositions = false } = options;

		const defaultColor = options.defaultColor
			? options.defaultColor(state)
			: resolvedSeries[0] && colorForSeries?.(resolvedSeries[0].name);

		const onProcessed = authorMarkers.map((marker) =>
			withProcessedRows(marker, state.processedData)
		);
		const positioned = inheritPositions
			? onProcessed.map((marker) => {
					if (!POSITIONED_KINDS.has(marker.type)) return marker;
					const own = marker as AxisBasedMarkersConfig & { x?: unknown; y?: unknown };
					return {
						...own,
						x: own.x ?? resolvedSeries[0]?.x ?? state.x,
						y: own.y ?? resolvedSeries[0]?.y ?? state.y
					} as AxisBasedMarkersConfig;
				})
			: onProcessed;

		const markers: AxisBasedMarkersConfig[] = [
			...resolvePlotStatistics({ series: resolvedSeries, statistics, colorFor: colorForSeries }),
			...expandMarkerStatistics(
				prepareAuthorMarkers(positioned, {
					grouping: inheritGrouping ? state.grouping : undefined,
					color: inheritGrouping ? state.color : undefined,
					defaultColor,
					flat,
					resolvedSeries,
					scopedGroups: state.scopedGroups
				}),
				flat
			)
		];
		return { ...state, markers };
	};
}
