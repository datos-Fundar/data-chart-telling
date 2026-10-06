import type { PositionChannels } from '$lib/types/transforms/common';

/** The reducers svelteplot's window transforms take by name. */
export type WindowReducer =
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

/** Options both window transforms take, flat next to the channels — same names as svelteplot's. */
type WindowOptions = {
	/** The window's size, in rows (or in `interval`s, when one is set). */
	k: number;
	/** What each window reduces to; defaults to `mean`. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	reduce?: WindowReducer | ((values: any[]) => unknown);
	/** Where each row sits in its window; defaults to `middle`. */
	anchor?: 'start' | 'middle' | 'end';
	/** Leaves out a window with fewer than `k` values (or than the number given), instead of reducing what it has. */
	strict?: boolean | number;
	/** Measures the window along the other axis in this interval (`'day'`, `7`, …) instead of in rows. */
	interval?: number | string;
};

/**
 * `windowY` as a marker transform: replaces each row's `y` (and `y1`/`y2`) with
 * a reduction of the `k` rows around it — a moving average by default. Runs
 * per `z` group, in row order.
 */
export type WindowYTransform = { type: 'windowY' } & PositionChannels & WindowOptions;

/** `windowX` — see {@link WindowYTransform}, on the `x` channels. */
export type WindowXTransform = { type: 'windowX' } & PositionChannels & WindowOptions;
