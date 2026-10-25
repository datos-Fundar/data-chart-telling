import type { StatisticConfig } from '$lib/types/layout/statistics';
import type { BoxMarkerConfig } from '$lib/types/markers/common';
import {
	STATISTIC_FALLBACK_COLOR,
	type StatisticSource
} from '$lib/types/phases/statistics/source';

/** Box-and-whisker summary of the source, drawn as a `box` marker. */
export class BoxStatistic {
	static build<T extends Record<string, unknown>>(
		source: StatisticSource<T>,
		config: Extract<StatisticConfig, { type: 'box' }>
	): BoxMarkerConfig[] {
		return [
			{
				type: 'box',
				data: source.data,
				x: source.x,
				y: source.y,
				sort: config.sort,
				bar: { fill: source.color ?? STATISTIC_FALLBACK_COLOR, ...config.bar },
				rule: config.rule,
				dot: config.dot,
				tickMedian: config.tickMedian,
				tickMinMax: config.tickMinMax
			}
		];
	}
}
