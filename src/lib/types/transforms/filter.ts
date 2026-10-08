import type { PositionChannels, TransformChannel } from '$lib/types/transforms/common';

/**
 * `filter` as a marker transform: keeps only the rows `filter` holds for -
 * a per-row test, or a field key whose value is truthy. Unlike filtering the
 * marker's `data` beforehand, it composes with the transforms around it.
 */
export type FilterTransform = {
	type: 'filter';
	filter: TransformChannel;
} & PositionChannels;

/** The keys `filter` reads as channels: every position channel, and `filter` itself. */
export const FILTER_CHANNEL_KEYS: Record<keyof PositionChannels | 'filter', true> = {
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
	filter: true
};
