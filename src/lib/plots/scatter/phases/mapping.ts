import { resolveAccessor } from '$lib/plots/utils/accessors';
import type { ScatterPlotState } from '$lib/types/plots/scatter/state';

/** ScatterPlot's "mapping" phase: x/y accessors and the optional per-row radius channel. Reads no ctx. */
export function buildMapping<TData extends Record<string, unknown>>(
	state: ScatterPlotState<TData>
): ScatterPlotState<TData> {
	const { resolvedSeries, r } = state;

	const xAcc = resolveAccessor(resolvedSeries![0]?.x ?? ((d: TData) => d));
	const yAcc = resolveAccessor(resolvedSeries![0]?.y ?? ((d: TData) => d));

	return {
		...state,
		channels: {
			x: { accessor: xAcc },
			y: { accessor: yAcc },
			r: r === undefined || typeof r === 'number' ? r : { accessor: resolveAccessor(r) }
		}
	};
}
