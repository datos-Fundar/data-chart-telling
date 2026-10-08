import type { TransformChannel, TransformReducer } from '$lib/types/transforms/common';

/** Channels every group transform reads: the grouped one(s), the value to reduce, and `z`. */
type GroupChannels = {
	data?: Record<string, unknown>[];
	x?: TransformChannel;
	y?: TransformChannel;
	z?: TransformChannel;
	/** Leaves out the rows this per-row test fails for, before grouping. */
	filter?: TransformChannel;
};

/** The keys every group transform reads as channels, at runtime. */
export const GROUP_CHANNEL_KEYS: Record<keyof GroupChannels, true> = {
	data: true,
	x: true,
	y: true,
	z: true,
	filter: true
};

/** Reducers for the non-positional outputs: `fill: 'count'` colors by the group's size, `r: 'sum'` sizes a dot by it. */
type GroupStyleOutputs = {
	fill?: TransformReducer;
	stroke?: TransformReducer;
	r?: TransformReducer;
	opacity?: TransformReducer;
	fillOpacity?: TransformReducer;
	strokeOpacity?: TransformReducer;
};

/** Options every group transform takes. */
type GroupOptions = {
	/** Groups values by this interval (`10`, `'month'`) instead of by each distinct value. */
	interval?: number | string;
	/** Fields copied onto each group's row from its first source row. */
	copy?: string[];
};

/**
 * `groupX` as a marker transform: one row per distinct `x` (and per `z` group),
 * its other channels reduced over the group's rows. The marker's `y` is the
 * value the `y` reducer reads, so `y: 'sum'` sums each group's `y`; here `y` is
 * always the reducer, as with a bin. `count` needs no `y` at all.
 */
export type GroupXTransform = {
	type: 'groupX';
	y?: TransformReducer;
	y1?: TransformReducer;
	y2?: TransformReducer;
	/** The field the group's `x` goes under on the output rows; defaults to `x`'s own field key. */
	xPropName?: string;
} & Omit<GroupChannels, 'y'> &
	GroupStyleOutputs &
	GroupOptions;

/** `groupY` - see {@link GroupXTransform}, grouping on `y` and reducing to `x`. */
export type GroupYTransform = {
	type: 'groupY';
	x?: TransformReducer;
	x1?: TransformReducer;
	x2?: TransformReducer;
	/** The field the group's `y` goes under on the output rows; defaults to `y`'s own field key. */
	yPropName?: string;
} & Omit<GroupChannels, 'x'> &
	GroupStyleOutputs &
	GroupOptions;

/** `groupZ` - one row per `z` group, every channel a reducer: `x: 'mean', y: 'mean'` is each group's centroid. */
export type GroupZTransform = {
	type: 'groupZ';
	x?: TransformReducer;
	x1?: TransformReducer;
	x2?: TransformReducer;
	y?: TransformReducer;
	y1?: TransformReducer;
	y2?: TransformReducer;
} & Omit<GroupChannels, 'x' | 'y'> &
	GroupStyleOutputs &
	GroupOptions;

/**
 * `group` as a marker transform: one row per distinct `x`-`y` pair - a grid of
 * categories - reduced to `fill`, `r` or another style output. `r: 'count'` on
 * a `dot` draws a bubble per pair, sized by how many rows share it.
 */
export type Group2DTransform = { type: 'group' } & GroupChannels &
	GroupStyleOutputs &
	Omit<GroupOptions, 'interval'>;
