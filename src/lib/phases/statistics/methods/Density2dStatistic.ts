import type { StatisticConfig } from '$lib/types/layout/statistics';
import type { DensityMarkerConfig } from '$lib/types/markers/common';
import {
	STATISTIC_FALLBACK_COLOR,
	type StatisticSource
} from '$lib/types/phases/statistics/source';

/** 2D kernel density over the source's `x` and `y`, drawn as a `density` marker. */
export class Density2dStatistic {
	static build<T extends Record<string, unknown>>(
		source: StatisticSource<T>,
		config: Extract<StatisticConfig, { type: 'density2d' }>
	): DensityMarkerConfig[] {
		return [
			{
				type: 'density',
				data: source.data,
				x: source.x,
				y: source.y,
				bandwidth: config.bandwidth,
				thresholds: config.thresholds,
				styles: {
					...config.styles,
					stroke: config.styles?.stroke ?? source.color ?? STATISTIC_FALLBACK_COLOR
				}
			}
		];
	}
}
