import { buildMarkers } from '$lib/plots/area/phases/markers';
import type { AxisPlotKind } from '$lib/types/layout/phases';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { AreaPlotState, AreaPlotCtx } from '$lib/types/plots/area/state';

/** AreaPlot on the shared pipeline: areas from a zero baseline, author markers taking the plot's `x`/`y`, and its own markers. */
export function buildAreaKind<TData extends Record<string, unknown>>(): AxisPlotKind<
	AreaPlotState<TData>,
	AreaPlotCtx
> {
	return {
		data: { segmentColor: (style: AreaStyle | undefined) => style?.fill },
		statistics: { inheritPositions: true },
		scales: { zero: ['y'] },
		markers: buildMarkers
	};
}
