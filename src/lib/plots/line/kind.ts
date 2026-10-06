import { lineDefaultColor } from '$lib/plots/line/lineDefaultColor';
import { buildMarkers } from '$lib/plots/line/phases/markers';
import type { AxisPlotKind } from '$lib/types/layout/phases';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { LinePlotState, LinePlotCtx } from '$lib/types/plots/line/state';

/** LinePlot on the shared pipeline: continuous segments colored by their stroke, and its own markers. */
export function buildLineKind<TData extends Record<string, unknown>>(): AxisPlotKind<
	LinePlotState<TData>,
	LinePlotCtx
> {
	return {
		data: { segmentColor: (style: LineSegmentStyle | undefined) => style?.stroke?.stroke },
		statistics: { defaultColor: lineDefaultColor },
		markers: buildMarkers
	};
}
