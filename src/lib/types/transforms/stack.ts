import type { TransformChannel } from '$lib/types/transforms/common';

/** Channels both stack transforms read, by svelteplot's own names. */
type StackChannels = {
	data?: Record<string, unknown>[];
	x?: TransformChannel;
	y?: TransformChannel;
	x1?: TransformChannel;
	x2?: TransformChannel;
	y1?: TransformChannel;
	y2?: TransformChannel;
	z?: TransformChannel;
	fill?: TransformChannel;
	stroke?: TransformChannel;
};

/** Options both stack transforms take, flat next to the channels — same names as svelteplot's. */
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

/** `stackX` as a marker transform — see {@link StackYTransform}. */
export type StackXTransform = { type: 'stackX' } & StackChannels & StackOptions;
