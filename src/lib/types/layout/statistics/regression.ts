import type { StrokeStyle } from '$lib/types/plots/styling';

/**
 * Regression model svelteplot's own `RegressionX`/`RegressionY` marks support
 * - same names, so nothing new to learn if you already know svelteplot.
 */
export type RegressionType = 'linear' | 'quad' | 'poly' | 'exp' | 'log' | 'pow' | 'loess';

/** Fit options for `type: 'regression'` - mirrors svelteplot's own `RegressionOptions` field-for-field. */
export type RegressionStatisticOptions = {
	regressionType?: RegressionType;
	/** Polynomial order (`regressionType: 'poly'`). */
	order?: number;
	/** Logarithm base (`regressionType: 'log'`). */
	base?: number;
	/** LOESS bandwidth, as a fraction of the data range, 0-1 (`regressionType: 'loess'`). */
	span?: number;
	/** Confidence-band level (e.g. `0.95`); svelteplot's own default is `0.99`. Set `false` to omit the band. */
	confidence?: number | false;
	/** The band always renders in the same color as `stroke`, at a fixed low opacity - no separate band color to set. */
	styles?: StrokeStyle;
};
