import type { PositionChannels } from '$lib/types/transforms/common';

/**
 * How each group's values are mapped: `cumsum` (a running total), `rank`
 * (0, 1, 2, …), `quantile` (rank as 0–1), or a function of the group's indices
 * and values returning the mapped values, in the same order.
 */
export type MapMethod =
	| 'cumsum'
	| 'rank'
	| 'quantile'
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| ((index: number[], values: any[]) => any[]);

/** The option both map transforms take. */
type MapOptions = {
	map: MapMethod;
};

/**
 * `mapY` as a marker transform: replaces each `z` group's `y` (and `y1`/`y2`)
 * values with a function of the whole group — unlike a per-row accessor, it
 * sees every value at once.
 */
export type MapYTransform = { type: 'mapY' } & PositionChannels & MapOptions;

/** `mapX` — see {@link MapYTransform}, on the `x` channels. */
export type MapXTransform = { type: 'mapX' } & PositionChannels & MapOptions;
