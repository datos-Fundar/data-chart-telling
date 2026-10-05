import { resolveAccessor } from '$lib/plots/utils/accessors';
import type { AreaPlotState } from '$lib/types/plots/area/state';

/** AreaPlot's "mapping" phase: each channel's own data accessor, read off the first resolved series. Reads no ctx. */
export function buildMapping<TData extends Record<string, unknown>>(
	state: AreaPlotState<TData>
): AreaPlotState<TData> {
	const { resolvedSeries } = state;
	const first = resolvedSeries?.[0];

	return {
		...state,
		channels: {
			x: { accessor: resolveAccessor<TData>(first?.x ?? ((d: TData) => d)) },
			y: { accessor: resolveAccessor<TData>(first?.y ?? ((d: TData) => d)) }
		}
	};
}
