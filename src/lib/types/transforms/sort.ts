import type { PositionChannels, TransformChannel } from '$lib/types/transforms/common';

/**
 * What to sort by: a field key or a per-row function (sorted ascending), a
 * comparator of two rows, or another channel by name, with its order.
 */
export type SortBy =
	| TransformChannel
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| ((a: any, b: any) => number)
	| { channel: string; order?: 'ascending' | 'descending' };

/**
 * `sort` as a marker transform: reorders the rows. Order matters wherever rows
 * are drawn in sequence: the path a `line` takes, which `dot` lands on top.
 */
export type SortTransform = {
	type: 'sort';
	sort: SortBy;
	/** Reverses the sorted order. */
	reverse?: boolean;
} & PositionChannels;

/** The keys `sort` reads as channels: every position channel, and `sort` itself. */
export const SORT_CHANNEL_KEYS: Record<keyof PositionChannels | 'sort', true> = {
	data: true,
	x: true,
	y: true,
	x1: true,
	x2: true,
	y1: true,
	y2: true,
	z: true,
	fill: true,
	stroke: true,
	sort: true
};

/** `shuffle` as a marker transform: puts the rows in a random order, the same one for the same `seed`. */
export type ShuffleTransform = {
	type: 'shuffle';
	/** Seeds the order; a fixed seed is used when unset. */
	seed?: number;
} & PositionChannels;

/** `reverse` as a marker transform: puts the rows in reverse order. */
export type ReverseTransform = { type: 'reverse' } & PositionChannels;
