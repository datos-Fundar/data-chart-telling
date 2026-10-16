import { Transforms } from '$lib/phases/transforms/Transforms';
import type { DensityStatisticOptions } from '$lib/types/layout/statistics';
import type { AreaMarkerConfig } from '$lib/types/markers/common';
import {
	STATISTIC_FALLBACK_COLOR,
	type StatisticSource
} from '$lib/types/phases/statistics/source';

/** 1D kernel density over the source's `x` values, drawn as an `area` marker. */
export class DensityStatistic {
	/**
	 * The `densityX` transform, wrapped into an `area` marker - the curve's own
	 * `x` is the value and `y` the density, so it draws on the plot's axes as-is.
	 * The output is one derived row per estimate point rather than one per input row.
	 */
	static build<T extends Record<string, unknown>>(
		source: StatisticSource<T>,
		config: DensityStatisticOptions
	): AreaMarkerConfig {
		const result = Transforms.run({
			type: 'densityX',
			data: source.data,
			x: source.x,
			kernel: config.kernel,
			bandwidth: config.bandwidth
		});
		return {
			type: 'area',
			data: result.data as Record<string, unknown>[],
			x: result.x as AreaMarkerConfig['x'],
			y: result.y as AreaMarkerConfig['y'],
			styles: {
				...config.styles,
				fill: config.styles?.fill ?? source.color ?? STATISTIC_FALLBACK_COLOR
			}
		};
	}
}
