import type { Accessor } from '$lib/types/plots/data/common';

export type AxisValue = number | string | Date;

/**
 * Every channel a plot maps from its rows, and what its accessor yields per
 * row. Every channel is available on every plot kind; a kind with no use for
 * one ignores it.
 */
export type ChannelValue = {
	/** Horizontal position — configure its axis via `scales.x`. */
	x: AxisValue;
	/** Vertical position — configure its axis via `scales.y`. */
	y: AxisValue;
	/**
	 * Splits `data` into one series per distinct value — the structural
	 * grouping key. Defaults to `color` when omitted, so a single `color`
	 * accessor groups *and* colors series; pass both to split by one field
	 * while coloring by another.
	 */
	grouping: unknown;
	/**
	 * Color value — splits `data` into one series per distinct value when
	 * `grouping` is unset. Configure the ramp via `scales.color`.
	 */
	color: unknown;
	/** Continuous or categorical opacity value — configure the ramp via `scales.opacity`. */
	opacity: unknown;
	/** Categorical shape value — configure the mapping via `scales.symbol`. */
	symbol: unknown;
	/**
	 * Radius — bound to an auto sqrt scale, so *area* ends up proportional to
	 * the raw values (an already-scaled value gets double-scaled). A literal
	 * number is a fixed pixel radius instead. Configure via `scales.r`.
	 */
	r: number;
	/** Vector/spike magnitude — a literal number is a fixed pixel length. Configure via `scales.length`. */
	length: number;
};

/** Every channel a plot maps from its rows. */
export type ChannelName = keyof ChannelValue;

/** The position channels, each bound to the one axis scale every mark shares. */
export type AxisChannelName = 'x' | 'y';

/**
 * The channels each consumer scales on its own — a plot's `scales.color` and
 * a marker's own `scales.color` can disagree on purpose.
 */
export type IndependentChannelName = 'color' | 'grouping' | 'opacity' | 'symbol';

/** The size channels, which also take a literal number as a fixed pixel size that bypasses their scale. */
export type SizeChannelName = 'r' | 'length';

/** Every channel as a plot prop: a field key or accessor function (or a literal size, for a size channel). */
export type ChannelAccessors<TData extends Record<string, unknown>> = {
	[K in keyof ChannelValue]?:
		| Accessor<TData, ChannelValue[K]>
		| (K extends SizeChannelName ? number : never);
};

/** One channel's own resolved data accessor — mirrors svelteplot's own `ChannelAccessor`. */
export type ResolvedChannel<TData, TValue = AxisValue> = {
	accessor: (row: TData) => TValue;
};

/**
 * Every channel as the "mapping" phase resolves it. `x`/`y` are always
 * resolved; any other channel only when its prop is set, and a size channel
 * stays a literal number when given one.
 */
export type ResolvedChannels<TData> = {
	[K in keyof ChannelValue]?:
		| ResolvedChannel<TData, ChannelValue[K]>
		| (K extends SizeChannelName ? number : never);
} & {
	[K in AxisChannelName]: ResolvedChannel<TData, ChannelValue[K]>;
};
