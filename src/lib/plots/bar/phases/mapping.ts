import { resolveAccessor } from '$lib/plots/utils/accessors';
import type { BarPlotState } from '$lib/types/plots/bar/state';

/** BarPlot's "mapping" phase: category/value axis assignment and each channel's own data accessor. Reads no ctx. */
export function buildMapping<TData extends Record<string, unknown>>(
	state: BarPlotState<TData>
): BarPlotState<TData> {
	const { scales, resolvedSeries } = state;

	const xCategorical = scales.x?.type === 'categorical';
	const yCategorical = scales.y?.type === 'categorical';
	let categoricalAxis: 'x' | 'y' = 'x';
	if (xCategorical && yCategorical) {
		console.warn(
			"BarPlot: scales.x.type and scales.y.type can't both be 'categorical' — " +
				'mark only one axis as the category axis. Defaulting to x.'
		);
	} else if (yCategorical) {
		categoricalAxis = 'y';
	}

	const xAcc = resolveAccessor(resolvedSeries![0]?.x ?? ((d: TData) => d));
	const yAcc = resolveAccessor(resolvedSeries![0]?.y ?? ((d: TData) => d));

	return {
		...state,
		categoricalAxis,
		isHorizontal: categoricalAxis === 'y',
		channels: {
			x: { accessor: xAcc },
			y: { accessor: yAcc }
		}
	};
}
