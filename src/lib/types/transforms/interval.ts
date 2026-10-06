import type { PositionChannels } from '$lib/types/transforms/common';

/** The option both interval transforms take. */
type IntervalOptions = {
	/** The interval each value is widened to: a number, or a named one (`'month'`, `'week'`, …). */
	interval: number | string;
};

/**
 * `intervalX` as a marker transform: widens each row's `x` into the interval
 * around it, floored to the interval — `x1` at its start, `x2` at the next
 * one's. A `rect` then spans each interval, like a bar on a continuous axis.
 */
export type IntervalXTransform = { type: 'intervalX' } & PositionChannels & IntervalOptions;

/** `intervalY` — see {@link IntervalXTransform}, producing `y1`/`y2`. */
export type IntervalYTransform = { type: 'intervalY' } & PositionChannels & IntervalOptions;

/** The keys the interval transforms read: every position channel, and `interval`, which svelteplot reads next to them. */
export const INTERVAL_CHANNEL_KEYS: Record<keyof PositionChannels | 'interval', true> = {
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
	interval: true
};
