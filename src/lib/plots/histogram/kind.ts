import { mergeBin } from '$lib/plots/histogram/phases/transforms';
import { buildMarkers } from '$lib/plots/histogram/phases/markers';
import type { AxisPlotKind } from '$lib/types/layout/phases';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { HistogramPlotState, HistogramPlotCtx } from '$lib/types/plots/histogram/state';

/**
 * HistogramPlot on the shared pipeline: series read only `x` (a flat series'
 * `y` is `x` too, a placeholder), binned by the plot's transforms merged over
 * the default bin, bars from a zero baseline, and its own markers.
 */
export function buildHistogramKind<TData extends Record<string, unknown>>(): AxisPlotKind<
	HistogramPlotState<TData>,
	HistogramPlotCtx
> {
	return {
		data: {
			segmentColor: (style: AreaStyle | undefined) => style?.fill,
			seriesChannels: (state) => ({ x: state.x, y: state.x })
		},
		transforms: { transforms: (state, ctx) => mergeBin(state.transforms ?? [], ctx.cfg) },
		scales: { zero: ['y'] },
		markers: buildMarkers
	};
}
