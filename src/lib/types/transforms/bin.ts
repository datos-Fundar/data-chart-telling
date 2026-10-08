import type { TransformChannel, TransformReducer } from '$lib/types/transforms/common';

type BinReducer = TransformReducer;

/** Channels both bin transforms read besides their binned one; `z` splits each bin by a group. */
type SharedBinChannels = {
	data?: Record<string, unknown>[];
	z?: TransformChannel;
	insetLeft?: number;
	insetRight?: number;
	insetTop?: number;
	insetBottom?: number;
};

/** Channels `binX` reads: its binned `x`, plus the shared ones. */
export type BinXChannels = SharedBinChannels & { x?: TransformChannel };

/** Channels `binY` reads: its binned `y`, plus the shared ones. */
export type BinYChannels = SharedBinChannels & { y?: TransformChannel };

/**
 * The keys of {@link BinXChannels}, at runtime. Typed as a record over the
 * type's own keys, so a key added to or removed from the type fails to compile here.
 */
export const BIN_X_CHANNEL_KEYS: Record<keyof BinXChannels, true> = {
	data: true,
	x: true,
	z: true,
	insetLeft: true,
	insetRight: true,
	insetTop: true,
	insetBottom: true
};

/** The keys of {@link BinYChannels}, at runtime - see {@link BIN_X_CHANNEL_KEYS}. */
export const BIN_Y_CHANNEL_KEYS: Record<keyof BinYChannels, true> = {
	data: true,
	y: true,
	z: true,
	insetLeft: true,
	insetRight: true,
	insetTop: true,
	insetBottom: true
};

/** Channels the 2D `bin` reads: both binned axes, plus the shared ones. */
export type Bin2DChannels = SharedBinChannels & { x?: TransformChannel; y?: TransformChannel };

/** The keys of {@link Bin2DChannels}, at runtime - see {@link BIN_X_CHANNEL_KEYS}. */
export const BIN_2D_CHANNEL_KEYS: Record<keyof Bin2DChannels, true> = {
	...BIN_X_CHANNEL_KEYS,
	y: true
};

/** Options both bin transforms take, flat next to the channels - same names as svelteplot's. */
type BinOptions = {
	/** Explicit thresholds, a count, or a named generator (`auto`, `scott`, `sturges`, `freedman-diaconis`). */
	thresholds?: 'auto' | 'scott' | 'sturges' | 'freedman-diaconis' | number | number[];
	/** Bin width as an interval (a number or a named one like `'day'`); takes over from `thresholds`. */
	interval?: number | string;
	/** The domain the bins cover. */
	domain?: [number, number];
	/** Accumulates the bins: `1` from the start, `-1` from the end. */
	cumulative?: false | 1 | -1;
	/** Reverses the output rows. */
	reverse?: boolean;
	/** Reducers for the bin's other output channels. */
	fill?: BinReducer;
	stroke?: BinReducer;
	r?: BinReducer;
	opacity?: BinReducer;
	fillOpacity?: BinReducer;
	strokeOpacity?: BinReducer;
};

/**
 * `binX` as a marker transform: its own props, flat, exactly as svelteplot's
 * `binX` takes them. Svelteplot names the binned channel `x` and its value
 * output `y` (a reducer such as `'count'`). Both live in one flat object, so
 * here `x` is the input and `y` is always the reducer - grouping goes through
 * `z`, which a marker fills from its `grouping`.
 */
export type BinXTransform = {
	type: 'binX';
	/** The bins' value - a reducer such as `'count'`. */
	y?: BinReducer;
} & BinXChannels &
	BinOptions;

/**
 * `binY` as a marker transform - see {@link BinXTransform}; here `y` is the
 * binned input and `x` is the reducer.
 */
export type BinYTransform = {
	type: 'binY';
	/** The bins' value - a reducer such as `'count'`. */
	x?: BinReducer;
} & BinYChannels &
	BinOptions;

/**
 * `bin` as a marker transform: bins on `x` and `y` at once, so each output row
 * is one cell of a 2D grid with its `x1`/`x2`/`y1`/`y2` edges. Its value goes to
 * one of the other channels - `fill: 'count'` colors each cell by its row count,
 * `r: 'count'` sizes a dot by it.
 */
export type Bin2DTransform = { type: 'bin' } & Bin2DChannels & BinOptions;
