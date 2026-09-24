import { resolveAccessor } from '$lib/plots/utils/accessors';
import type { LinePlotState } from '$lib/types/plots/line/state';

/** LinePlot's "mapping" phase: each channel's own data accessor. Reads no ctx. */
export function buildMapping<TData extends Record<string, unknown>>(
	state: LinePlotState<TData>
): LinePlotState<TData> {
	const { resolvedSeries } = state;

	const xAcc = resolveAccessor(resolvedSeries![0]?.x ?? ((d: TData) => d));
	const yAcc = resolveAccessor(resolvedSeries![0]?.y ?? ((d: TData) => d));

	return {
		...state,
		channels: {
			x: { accessor: xAcc },
			y: { accessor: yAcc }
		}
	};
}
