import type { TransformChannel } from '$lib/types/transforms/common';

/**
 * A reducer a bin transform runs over each bin's rows: svelteplot's own name
 * (`count`, `sum`, `mean`, …) or a function of the rows.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BinReducer = string | ((group: any[]) => unknown);

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

/** The keys of {@link BinYChannels}, at runtime — see {@link BIN_X_CHANNEL_KEYS}. */
export const BIN_Y_CHANNEL_KEYS: Record<keyof BinYChannels, true> = {
	data: true,
	y: true,
	z: true,
	insetLeft: true,
	insetRight: true,
	insetTop: true,
	insetBottom: true
};

/** Options both bin transforms take, flat next to the channels — same names as svelteplot's. */
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
 * here `x` is the input and `y` is always the reducer — grouping goes through
 * `z`, which a marker fills from its `grouping`.
 */
export type BinXTransform = {
	type: 'binX';
	/** The bins' value — a reducer such as `'count'`. */
	y?: BinReducer;
} & BinXChannels &
	BinOptions;

/**
 * `binY` as a marker transform — see {@link BinXTransform}; here `y` is the
 * binned input and `x` is the reducer.
 */
export type BinYTransform = {
	type: 'binY';
	/** The bins' value — a reducer such as `'count'`. */
	x?: BinReducer;
} & BinYChannels &
	BinOptions;
