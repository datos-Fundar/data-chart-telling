import {
	POSITION_CHANNEL_KEYS,
	type PositionChannels,
	type TransformChannel
} from '$lib/types/transforms/common';

/** Channels both stack transforms read, by svelteplot's own names. */
export type StackChannels = PositionChannels;

/** The keys of {@link StackChannels}, at runtime. */
export const STACK_CHANNEL_KEYS = POSITION_CHANNEL_KEYS;

/** Options both stack transforms take, flat next to the channels - same names as svelteplot's. */
type StackOptions = {
	/** Offset method; unset keeps svelteplot's zero baseline. */
	offset?: 'none' | 'wiggle' | 'center' | 'normalize' | 'diverging' | null;
	/** Series order; unset keeps the input order. */
	order?: 'none' | 'appearance' | 'inside-out' | 'sum' | null;
	/** Reverses the stacking order. */
	reverse?: boolean;
};

/**
 * `stackY` as a marker transform: its own props, flat, exactly as svelteplot's
 * `stackY` takes them. `type` picks the transform; everything else is that
 * transform's own input.
 */
export type StackYTransform = { type: 'stackY' } & StackChannels & StackOptions;

/** `stackX` as a marker transform - see {@link StackYTransform}. */
export type StackXTransform = { type: 'stackX' } & StackChannels & StackOptions;

/**
 * Channels the mosaic stacks read: the outer category, the inner category, and
 * each cell's `value`. svelteplot reads all three straight off the rows, so
 * they're field keys, not functions.
 */
export type StackMosaicChannels = {
	data?: Record<string, unknown>[];
	x?: string;
	y?: string;
	value?: string;
	fill?: TransformChannel;
	stroke?: TransformChannel;
};

/** The keys of {@link StackMosaicChannels}, at runtime - see {@link POSITION_CHANNEL_KEYS}. */
export const STACK_MOSAIC_CHANNEL_KEYS: Record<keyof StackMosaicChannels, true> = {
	data: true,
	x: true,
	y: true,
	value: true,
	fill: true,
	stroke: true
};

/**
 * Options the mosaic stacks take. svelteplot nests them as `{ x: { percent }, y: { percent } }`,
 * which would clash with the flat `x`/`y` channels, so they're flattened here.
 */
type StackMosaicOptions = {
	/** Puts `x` in fractions of the whole (0-1) instead of the values' own sums. */
	percentX?: boolean;
	/** Puts `y` in fractions of the whole (0-1) instead of the values' own sums. */
	percentY?: boolean;
};

/**
 * `stackMosaicX` as a marker transform: a mosaic (Marimekko) layout. Each `x`
 * category gets a column as wide as its total `value`, split along `y` by its
 * inner categories. Produces `x1`/`x2`/`y1`/`y2` for a `rect` marker.
 */
export type StackMosaicXTransform = { type: 'stackMosaicX' } & StackMosaicChannels &
	StackMosaicOptions;

/** `stackMosaicY` - see {@link StackMosaicXTransform}, with the outer categories along `y`. */
export type StackMosaicYTransform = { type: 'stackMosaicY' } & StackMosaicChannels &
	StackMosaicOptions;
