import { resolveAccessor } from '$lib/plots/utils/accessors';
import type { HeatmapPlotState } from '$lib/types/plots/heatmap/state';

/** HeatmapPlot's "mapping" phase: x/y/z (color value) accessors. Reads no ctx. */
export function buildMapping<TData extends Record<string, unknown>>(
	state: HeatmapPlotState<TData>
): HeatmapPlotState<TData> {
	const { resolvedSeries, x, y, z } = state;

	return {
		...state,
		channels: {
			x: { accessor: resolveAccessor<TData>(resolvedSeries![0]?.x ?? x!) },
			y: { accessor: resolveAccessor<TData>(resolvedSeries![0]?.y ?? y!) },
			z: { accessor: resolveAccessor<TData>(resolvedSeries![0]?.z ?? z!) }
		}
	};
}
