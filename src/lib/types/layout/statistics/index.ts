import type { RegressionStatisticOptions } from './regression';
import type { BollingerStatisticOptions } from './bollinger';
import type { MovingAverageStatisticOptions } from './movingAverage';
import type { DensityStatisticOptions, Density2DStatisticOptions } from './density';
import type { BoxStatisticOptions } from './box';
import type { DeviationStatisticOptions } from './deviation';

export type {
	DeviationBandLabel,
	DeviationEstimator,
	DeviationLabel,
	DeviationSpread,
	DeviationStatisticOptions
} from './deviation';
export type { RegressionType, RegressionStatisticOptions } from './regression';
export type { BollingerStatisticOptions } from './bollinger';
export type { StatisticReducer, MovingAverageStatisticOptions } from './movingAverage';
export type { DensityKernel, DensityStatisticOptions, Density2DStatisticOptions } from './density';
export type { BoxStatisticOptions } from './box';

/**
 * Which series a plot-level statistic runs over. Omitted: one derived
 * statistic per series, so a plot grouped by `color`/`grouping` gets its
 * statistics grouped the same way. Named: only the listed series. `pooled:
 * true`: one statistic over every series combined. Ignored on a marker's own
 * `.statistics` - a marker has exactly one source, its own `data`.
 */
export type StatisticScope = { series?: string[]; pooled?: boolean };

/**
 * A statistic to compute and draw as one or more derived markers - the same
 * shape whether attached to a plot's own top-level `statistics` prop or a
 * marker's own `.statistics`. `regression`/`bollinger` resolve straight to
 * svelteplot's own `RegressionX`/`Y` and `BollingerX`/`Y` marks (no
 * computation of our own); `movingAverage` has no svelteplot mark, so it
 * calls svelteplot's own `windowY` transform and wraps the result into a
 * `line` marker. `density` (1D) calls svelteplot's own `densityX` transform
 * and wraps the curve into an `area` marker; `density2d` and `box` resolve
 * straight to the same `density` and `box` markers a plot author can write
 * directly; `deviation` computes an estimator and its spread over the plot's
 * value axis and draws them as a `rule` and a `rect` marker.
 */
export type StatisticConfig = StatisticScope &
	(
		| ({ type: 'regression' } & RegressionStatisticOptions)
		| ({ type: 'bollinger' } & BollingerStatisticOptions)
		| ({ type: 'movingAverage' } & MovingAverageStatisticOptions)
		| ({ type: 'density' } & DensityStatisticOptions)
		| ({ type: 'density2d' } & Density2DStatisticOptions)
		| ({ type: 'box' } & BoxStatisticOptions)
		| ({ type: 'deviation' } & DeviationStatisticOptions)
	);
