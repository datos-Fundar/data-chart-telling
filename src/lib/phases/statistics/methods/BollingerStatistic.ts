import type { StatisticConfig } from '$lib/types/layout/statistics';
import type { BollingerMarkerConfig } from '$lib/types/markers/common';
import {
	STATISTIC_FALLBACK_COLOR,
	type StatisticSource
} from '$lib/types/phases/statistics/source';

/** Bollinger bands over the source, drawn as a `bollinger` marker (svelteplot computes them at render time). */
export class BollingerStatistic {
	static build<T extends Record<string, unknown>>(
		source: StatisticSource<T>,
		config: Extract<StatisticConfig, { type: 'bollinger' }>
	): BollingerMarkerConfig[] {
		return [
			{
				type: 'bollinger',
				data: source.data,
				x: source.x,
				y: source.y,
				n: config.n,
				k: config.k,
				styles: {
					...config.styles,
					stroke: config.styles?.stroke ?? source.color ?? STATISTIC_FALLBACK_COLOR
				}
			}
		];
	}
}
