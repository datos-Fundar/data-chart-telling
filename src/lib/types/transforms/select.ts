import type { PositionChannels } from '$lib/types/transforms/common';

/** Which row `select` keeps per group: the first or last one, or the one with the lowest or highest value of a channel. */
export type SelectBy = 'first' | 'last' | Partial<Record<'x' | 'y', 'min' | 'max'>>;

/**
 * `select` as a marker transform: keeps one row per `z` group. Handy for
 * labelling a line's end, or marking each series' peak.
 */
export type SelectTransform = { type: 'select'; select: SelectBy } & PositionChannels;

/** Shorthands for {@link SelectTransform}: `selectFirst` is `select: 'first'`, `selectMaxY` is `select: { y: 'max' }`, and so on. */
export type SelectShorthandTransform = {
	type: 'selectFirst' | 'selectLast' | 'selectMinX' | 'selectMaxX' | 'selectMinY' | 'selectMaxY';
} & PositionChannels;
