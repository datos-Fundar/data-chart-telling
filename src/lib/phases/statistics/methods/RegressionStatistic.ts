import type { StatisticConfig } from '$lib/types/layout/statistics';
import type { RegressionMarkerConfig } from '$lib/types/markers/common';
import {
	STATISTIC_FALLBACK_COLOR,
	type StatisticSource
} from '$lib/types/phases/statistics/source';

/** A regression curve over the source, drawn as a `regression` marker (svelteplot fits it at render time). */
export class RegressionStatistic {
	static build<T extends Record<string, unknown>>(
		source: StatisticSource<T>,
		config: Extract<StatisticConfig, { type: 'regression' }>
	): RegressionMarkerConfig[] {
		return [
			{
				type: 'regression',
				data: source.data,
				x: source.x,
				y: source.y,
				regressionType: config.regressionType,
				order: config.order,
				base: config.base,
				span: config.span,
				confidence: config.confidence,
				styles: {
					...config.styles,
					stroke: config.styles?.stroke ?? source.color ?? STATISTIC_FALLBACK_COLOR
				}
			}
		];
	}
}
