import type { StrokeStyle } from '$lib/types/plots/styling';

/**
 * Window reducers svelteplot's own `windowX`/`windowY` transform supports.
 * Not re-exported from svelteplot's own public API, so declared here
 * verbatim rather than imported — passed straight through to `windowY`.
 */
export type StatisticReducer =
	| 'count'
	| 'deviation'
	| 'difference'
	| 'first'
	| 'last'
	| 'max'
	| 'mean'
	| 'median'
	| 'min'
	| 'mode'
	| 'ratio'
	| 'sum'
	| 'variance';

/** Sliding-window options for `type: 'movingAverage'` — mirrors svelteplot's own `windowY` `WindowOptions`. */
export type MovingAverageStatisticOptions = {
	/** Window size, in number of points. */
	k: number;
	/** Reducer applied within each window. Defaults to `'mean'`. */
	reduce?: StatisticReducer;
	styles?: StrokeStyle;
};
