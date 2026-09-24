import { buildSeries } from '$lib/utils/grouping';
import type { HeatmapPlotState } from '$lib/types/plots/heatmap/state';

/** HeatmapPlot's "data" phase: resolved series and its flattened rows. Reads no ctx. */
export function buildData<TData extends Record<string, unknown>>(
	state: HeatmapPlotState<TData>
): HeatmapPlotState<TData> {
	const { series, data, x, y } = state;

	const resolvedSeries = series ?? buildSeries(data!, x!, y!, undefined);
	const flat = resolvedSeries.flatMap((s) => s.data);

	return { ...state, resolvedSeries, flat };
}
