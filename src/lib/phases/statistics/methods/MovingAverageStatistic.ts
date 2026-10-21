import { Transforms } from '$lib/phases/transforms/Transforms';
import type { MovingAverageStatisticOptions } from '$lib/types/layout/statistics';
import type { LineMarkerConfig } from '$lib/types/markers/common';
import {
	STATISTIC_FALLBACK_COLOR,
	type StatisticSource
} from '$lib/types/phases/statistics/source';

/** Sliding-window reducer (mean/median/sum/...) drawn as a `line` marker. */
export class MovingAverageStatistic {
	/**
	 * The `windowY` transform, wrapped into our own `line` marker - svelteplot has
	 * no dedicated mark for this (unlike `regression`/`bollinger`). `windowY`
	 * keeps one output row per input row, so `x` passes straight through.
	 */
	static build<T extends Record<string, unknown>>(
		source: StatisticSource<T>,
		config: MovingAverageStatisticOptions
	): LineMarkerConfig[] {
		const result = Transforms.run({
			type: 'windowY',
			data: source.data,
			x: source.x,
			y: source.y,
			k: config.k,
			reduce: config.reduce ?? 'mean'
		});
		return [
			{
				type: 'line',
				data: result.data as Record<string, unknown>[],
				x: result.x as LineMarkerConfig['x'],
				y: result.y as LineMarkerConfig['y'],
				styles: {
					...config.styles,
					stroke: config.styles?.stroke ?? source.color ?? STATISTIC_FALLBACK_COLOR
				}
			}
		];
	}
}
