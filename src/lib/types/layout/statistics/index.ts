import type { RegressionStatisticOptions } from './regression';
import type { BollingerStatisticOptions } from './bollinger';
import type { MovingAverageStatisticOptions } from './movingAverage';

export type { RegressionType, RegressionStatisticOptions } from './regression';
export type { BollingerStatisticOptions } from './bollinger';
export type { StatisticReducer, MovingAverageStatisticOptions } from './movingAverage';

/**
 * Which series a plot-level statistic runs over. Omitted: pools every
 * resolved series into one combined source. Named: one derived statistic per
 * listed series. Ignored on a marker's own `.statistics` — a marker has
 * exactly one source, its own `data`.
 */
export type StatisticScope = { series?: string[] };

/**
 * A statistic to compute and draw as one or more derived markers — the same
 * shape whether attached to a plot's own top-level `statistics` prop or a
 * marker's own `.statistics`. `regression`/`bollinger` resolve straight to
 * svelteplot's own `RegressionX`/`Y` and `BollingerX`/`Y` marks (no
 * computation of our own); `movingAverage` has no svelteplot mark, so it
 * calls svelteplot's own `windowY` transform and wraps the result into a
 * `line` marker.
 */
export type StatisticConfig = StatisticScope &
	(
		| ({ type: 'regression' } & RegressionStatisticOptions)
		| ({ type: 'bollinger' } & BollingerStatisticOptions)
		| ({ type: 'movingAverage' } & MovingAverageStatisticOptions)
	);
