import { resolveAccessor } from '$lib/plots/utils/accessors';
import type { LinePlotState } from '$lib/types/plots/line/state';

/** LinePlot's "mapping" phase: each channel's own data accessor. Reads no ctx. */
export function buildMapping<TData extends Record<string, unknown>>(
	state: LinePlotState<TData>
): LinePlotState<TData> {
	const { resolvedSeries, grouping, color } = state;

	const xAcc = resolveAccessor(resolvedSeries![0]?.x ?? ((d: TData) => d));
	const yAcc = resolveAccessor(resolvedSeries![0]?.y ?? ((d: TData) => d));
	const rowGrouping = grouping ?? color;
	const rowColor = resolvedSeries![0]?.color ?? color;

	return {
		...state,
		channels: {
			x: { accessor: xAcc },
			y: { accessor: yAcc },
			grouping: rowGrouping !== undefined ? { accessor: resolveAccessor<TData>(rowGrouping) } : undefined,
			color: rowColor !== undefined ? { accessor: resolveAccessor<TData>(rowColor) } : undefined
		}
	};
}
