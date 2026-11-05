import type { TransformChannel } from '$lib/types/transforms/common';

/** How a treemap splits a rectangle among its children. */
export type TreemapTile = 'squarify' | 'binary' | 'slice' | 'dice' | 'sliceDice';

/** Channels the treemap reads: the rows, and each one's `value` - what its tile's area is. */
export type TreemapChannels = {
	data?: Record<string, unknown>[];
	value?: TransformChannel;
};

/** The keys of {@link TreemapChannels}, at runtime. */
export const TREEMAP_CHANNEL_KEYS: Record<keyof TreemapChannels, true> = {
	data: true,
	value: true
};

/** Options the treemap takes, flat next to the channels. */
type TreemapOptions = {
	/**
	 * What the tiles nest by: one reader per level, outermost first. Rows with the same value at every
	 * level are one tile, whose area is their values' sum, and the last level names it. Without levels,
	 * every row is part of a single tile.
	 */
	levels?: TransformChannel[];
	/** How a rectangle is split among its tiles. Defaults to `'squarify'`, which keeps them close to squares. */
	tile?: TreemapTile;
	/** The width over the height of the box the tiles fill, which squarified tiles aim to be square in. Defaults to `1`. */
	aspect?: number;
};

/**
 * `treemap` as a marker transform: a tile per distinct path of `levels`, laid out in the unit square with
 * d3-hierarchy, its area its summed `value`. Produces `x1`/`x2`/`y1`/`y2` for a `rect` marker, and `x`/`y`
 * at each tile's centre; each row also carries its tile's name, path, value and share (see `TREEMAP_ROW`).
 */
export type TreemapTransform = { type: 'treemap' } & TreemapChannels & TreemapOptions;
