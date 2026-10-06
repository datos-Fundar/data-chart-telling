import type { StrokeStyle } from '$lib/types/plots/styling';
import type { WindowReducer } from '$lib/types/transforms/window';

/** Window reducers the `windowY` transform takes by name. */
export type StatisticReducer = WindowReducer;

/** Sliding-window options for `type: 'movingAverage'` — runs the `windowY` transform. */
export type MovingAverageStatisticOptions = {
	/** Window size, in number of points. */
	k: number;
	/** Reducer applied within each window. Defaults to `'mean'`. */
	reduce?: StatisticReducer;
	styles?: StrokeStyle;
};
