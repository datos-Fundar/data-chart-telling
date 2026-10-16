import type { PositionChannels } from '$lib/types/transforms/common';

/**
 * An amount to shift by: a number in data units, or a duration on a time axis
 * - `'1 month'`, `'-2 weeks'`, `'+1 day'`.
 */
export type ShiftAmount = number | string;

/**
 * `shiftX` as a marker transform: moves every row's `x` by `by`. Given one
 * amount per channel (`{ x1: '-1 week', x2: '+1 week' }`), it also widens a
 * point into an interval, each channel taken from `x` when the marker has none of its own.
 */
export type ShiftXTransform = {
	type: 'shiftX';
	by: ShiftAmount | Partial<Record<'x' | 'x1' | 'x2', ShiftAmount>>;
} & PositionChannels;

/** `shiftY` - see {@link ShiftXTransform}, on the `y` channels. */
export type ShiftYTransform = {
	type: 'shiftY';
	by: ShiftAmount | Partial<Record<'y' | 'y1' | 'y2', ShiftAmount>>;
} & PositionChannels;
