import { buildScales } from '$lib/plots/heatmap/phases/scales';
import { buildMarkers } from '$lib/plots/heatmap/phases/markers';
import { formatValue } from '$lib/layout/tooltip/format';
import type { AxisPlotKind } from '$lib/types/layout/phases';
import type { HeatmapPlotState, HeatmapPlotCtx } from '$lib/types/plots/heatmap/state';

/**
 * HeatmapPlot on the shared pipeline. A heatmap's `color` is each cell's
 * value, not a grouping key, so nothing groups by it: the rows stay one
 * series, and author markers don't inherit it. Its own band/color scales and
 * markers; a cell's tooltip names its coordinates and its value.
 */
export function buildHeatmapKind<TData extends Record<string, unknown>>(): AxisPlotKind<
	HeatmapPlotState<TData>,
	HeatmapPlotCtx
> {
	return {
		data: { grouping: (state) => state.grouping },
		mapping: {
			grouping: (state) => state.grouping,
			// A heatmap with no `color` still reads one per cell, as nothing.
			extend: (state) => ({
				...state,
				channels: {
					...state.channels!,
					color: state.channels!.color ?? { accessor: () => undefined }
				}
			})
		},
		statistics: { inheritGrouping: false },
		scales: { override: buildScales },
		markers: buildMarkers,
		tooltip: {
			format: (state) => {
				const { x, y, color } = state.channels!;
				const format = state.values?.format ?? ((v: number) => `${v}`);
				const xLabel = state.scales.x?.label || 'x';
				const yLabel = state.scales.y?.label || 'y';
				return (row) =>
					`${xLabel} ${formatValue(x.accessor(row as TData))} · ${yLabel} ${formatValue(y.accessor(row as TData))}\n${format(Number(color!.accessor(row as TData)), '')}`;
			}
		}
	};
}
