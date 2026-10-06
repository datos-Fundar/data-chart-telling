import { buildProcessedGroups } from '$lib/layout/phases/transforms';
import { finishTransforms } from '$lib/utils/transforms';
import type { HistogramPlotState, HistogramPlotCtx } from '$lib/types/plots/histogram/state';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { AreaStyle } from '$lib/types/plots/styling';

/**
 * HistogramPlot's "markers" phase: one `rect` per visual segment of each
 * series, drawing that segment's bins. The markers the "statistics" phase
 * already put in `state.markers` come after.
 */
export function buildMarkers<TData extends Record<string, unknown>>(
	state: HistogramPlotState<TData>,
	ctx: HistogramPlotCtx
): HistogramPlotState<TData> {
	const { channels, options, transforms } = state.processedData!;
	const fillOpacity = ctx.cfg.histogram.fillOpacity;

	// Bins are discrete, so adjacent segments share no boundary bar to bridge.
	const rects = buildProcessedGroups<AreaStyle>(state, false).flatMap((group) =>
		group.visualSegments.map((seg) =>
			finishTransforms(
				{
					type: 'rect',
					series: group.series.name,
					data: seg.data,
					...channels,
					...options,
					styles: {
						fillOpacity: seg.styles.fillOpacity ?? fillOpacity,
						...(seg.styles.fill !== undefined ? { fill: seg.styles.fill } : {})
					}
				},
				transforms
			)
		)
	) as unknown as AxisBasedMarkersConfig[];

	return { ...state, markers: [...rects, ...(state.markers ?? [])] };
}
