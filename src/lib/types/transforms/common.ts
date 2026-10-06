import type { AxisValue } from '$lib/types/layout/mapping';

/**
 * A channel a transform reads: a field key, or a per-row function — the same
 * shape every marker's own `x`/`y` takes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TransformChannel = string | ((d: any) => AxisValue | unknown);

/**
 * A reducer a grouping transform (bin, group) runs over each group's rows:
 * svelteplot's own name (`count`, `sum`, `mean`, `p25`, …) or a function of the rows.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TransformReducer = string | ((group: any[]) => unknown);

/** The position channels most transforms read, by svelteplot's own names; `z` splits the rows into groups. */
export type PositionChannels = {
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

/**
 * The keys of {@link PositionChannels}, at runtime. Typed as a record over the
 * type's own keys, so a key added to or removed from the type fails to compile here.
 */
export const POSITION_CHANNEL_KEYS: Record<keyof PositionChannels, true> = {
	data: true,
	x: true,
	y: true,
	x1: true,
	x2: true,
	y1: true,
	y2: true,
	z: true,
	fill: true,
	stroke: true
};
