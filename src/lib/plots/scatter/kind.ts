import { buildScales } from '$lib/plots/scatter/phases/scales';
import { buildMarkers } from '$lib/plots/scatter/phases/markers';
import { buildChannelTooltipFormat } from '$lib/layout/tooltip/format';
import type { AxisPlotKind } from '$lib/types/layout/phases';
import type { ScatterSegmentStyle } from '$lib/types/plots/segments/common';
import type { ScatterPlotState, ScatterPlotCtx } from '$lib/types/plots/scatter/state';

/** ScatterPlot on the shared pipeline: discrete dots, its own radius-padded scales, and its own markers. */
export function buildScatterKind<TData extends Record<string, unknown>>(): AxisPlotKind<
	ScatterPlotState<TData>,
	ScatterPlotCtx
> {
	return {
		data: {
			connect: false,
			segmentColor: (style: ScatterSegmentStyle | undefined) => style?.dotFill
		},
		scales: { override: buildScales },
		markers: buildMarkers,
		tooltip: {
			format: (state) => buildChannelTooltipFormat(state, { series: false, separator: ', ' })
		}
	};
}
