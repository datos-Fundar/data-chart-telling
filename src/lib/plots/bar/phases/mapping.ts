import { resolveAccessor } from '$lib/plots/utils/accessors';
import type { ResolvedChannel } from '$lib/types/layout/mapping';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { Series } from '$lib/types/plots/data/common';

export type BarMapping<TData extends Record<string, unknown>> = {
	categoricalAxis: 'x' | 'y';
	isHorizontal: boolean;
	channels: {
		x: ResolvedChannel<TData>;
		y: ResolvedChannel<TData>;
	};
};

/** BarPlot's category/value axis assignment and each channel's own data accessor. */
export function buildMapping<TData extends Record<string, unknown>>(args: {
	scales: AxisBasedScalesConfig<TData>;
	resolvedSeries: Series<TData>[];
}): BarMapping<TData> {
	const { scales, resolvedSeries } = args;

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

	const xAcc = resolveAccessor(resolvedSeries[0]?.x ?? ((d: TData) => d));
	const yAcc = resolveAccessor(resolvedSeries[0]?.y ?? ((d: TData) => d));

	return {
		categoricalAxis,
		isHorizontal: categoricalAxis === 'y',
		channels: {
			x: { accessor: xAcc },
			y: { accessor: yAcc }
		}
	};
}
