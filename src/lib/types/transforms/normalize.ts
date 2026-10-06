import type { PositionChannels } from '$lib/types/transforms/common';

/**
 * What each group's values are divided by (or, for `deviation` and `extent`,
 * rescaled against): a named basis, or a function of the group's indices and values.
 */
export type NormalizeBasis =
	| 'first'
	| 'last'
	| 'min'
	| 'max'
	| 'mean'
	| 'median'
	| 'sum'
	| 'deviation'
	| 'extent'
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| ((index: number[], values: any[]) => number);

/** The option every normalize transform takes. */
type NormalizeOptions = {
	/** Defaults to `first`: each group then starts at 1. */
	basis?: NormalizeBasis;
};

/**
 * `normalizeY` as a marker transform: divides each `z` group's `y` values by
 * the group's own `basis`, so groups on different scales share one axis —
 * `first` indexes every series to its starting value.
 */
export type NormalizeYTransform = { type: 'normalizeY' } & PositionChannels & NormalizeOptions;

/** `normalizeX` — see {@link NormalizeYTransform}, on `x`. */
export type NormalizeXTransform = { type: 'normalizeX' } & PositionChannels & NormalizeOptions;

/**
 * `normalizeParallelY` as a marker transform, for parallel coordinates: each
 * `x` category (an axis) is normalized on its own, while `z` still keeps one
 * line per record. With `basis: 'extent'`, every axis spans 0–1.
 */
export type NormalizeParallelYTransform = { type: 'normalizeParallelY' } & PositionChannels &
	NormalizeOptions;

/** `normalizeParallelX` — see {@link NormalizeParallelYTransform}, with the axes along `y`. */
export type NormalizeParallelXTransform = { type: 'normalizeParallelX' } & PositionChannels &
	NormalizeOptions;
