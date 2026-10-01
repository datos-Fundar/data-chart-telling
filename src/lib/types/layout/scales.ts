import type { SymbolType } from '$lib/types/plots/constants';

export type AxisValue = number | string | Date;

// ── Per-consumer independent channels ────────────────────────────────────────
// Each of these resolves its own ramp, independently per consumer — a plot's
// own `scales.color` and a marker's own `scales.color` can disagree on
// purpose (see `Channels/Color/Independent Ramps`). `x`/`y`/`r`/`length` are
// deliberately not members of this group — see their own section below for
// why they need the opposite guarantee (exactly one shared scale).

/** A continuous or categorical color ramp. */
export type ColorScaleConfig = {
	/** `[min, max]` for a continuous ramp, or the category list for a categorical one. Auto-computed from the data when omitted. */
	domain?: [number, number] | string[];
	/**
	 * A named d3-scale-chromatic ramp (e.g. `'turbo'`, `'blues'`, `'rdylbu'` —
	 * case-insensitive), 2+ literal colors interpolated across `domain`, or a
	 * category → color map. Defaults to the theme's own 2-color ramp.
	 */
	scheme?: string | string[] | Record<string, string>;
	/** Splits an array `scheme` into two halves meeting at this domain value (diverging). Ignored for a `Record` scheme. */
	pivot?: number;
	/** Fallback color for a missing/unmapped value. Defaults to `'#ccc'`. */
	unknown?: string;
};

/**
 * How rows/series sharing the same `grouping`/`color` value are laid out
 * relative to each other. `reverse` flips which group sorts first (e.g.
 * PyramidPlot's left/right side order); `seriesLayout`/`seriesPadding`
 * control how BarPlot arranges multiple series sharing the same category
 * (overlapping, side-by-side, or stacked).
 */
export type GroupingScaleConfig = {
	reverse?: boolean;
	seriesLayout?: 'overlap' | 'grouped' | 'stacked';
	seriesPadding?: number;
};

/** A continuous or categorical opacity ramp — maps a value to a numeric `[0,1]`-ish opacity instead of a color. */
export type OpacityScaleConfig = {
	/** `[min, max]` for a continuous ramp, or the category list for a categorical one. Auto-computed from the data when omitted. */
	domain?: [number, number] | string[];
	/** `[minOpacity, maxOpacity]` for continuous, or a category → opacity map. Defaults to the theme's own `continuous.opacityRange`. */
	range?: [number, number] | Record<string, number>;
	/** Fallback opacity for a missing/unmapped value. Defaults to `1`. */
	unknown?: number;
};

/** A categorical shape ramp — maps distinct values to marker shapes. Always discrete. */
export type SymbolScaleConfig = {
	domain?: string[];
	/** Shapes cycled through in `domain` order, or a category → shape map. Defaults to a built-in cycle. */
	range?: SymbolType[] | Record<string, SymbolType>;
	unknown?: SymbolType;
};

/**
 * Every channel this package resolves independently per consumer. Add a
 * channel here and to {@link ChannelScaleConfig} and it's available in
 * `scales.<channel>` on every axis-based plot kind, and the same shape on a
 * marker's own `scales`.
 */
export type ChannelName = 'color' | 'grouping' | 'opacity' | 'symbol';

/** Each {@link ChannelName}'s own scale-config shape. */
export type ChannelScaleConfig = {
	color: ColorScaleConfig;
	grouping: GroupingScaleConfig;
	opacity: OpacityScaleConfig;
	symbol: SymbolScaleConfig;
};

/** `scales.<channel>` for every channel in `TChannel` — the shared shape for both a plot's own `scales` prop and a marker's own. */
export type ChannelScalesConfig<TChannel extends ChannelName = ChannelName> = {
	[K in TChannel]?: ChannelScaleConfig[K];
};

// ── Plot-wide-only channels ──────────────────────────────────────────────────
// Each bound to exactly one scale shared by every mark in the plot — svelteplot
// has no per-mark override the way `color` does, so these stay outside
// {@link ChannelScalesConfig} entirely. `domain`/`range` thread straight into
// svelteplot's own scale rather than getting resolved by a from-scratch
// function, since svelteplot's own scale math (sqrt-area for `r`, linear for
// `length`) is already correct — this only exposes author control over its
// domain/range, it doesn't replace it.

/** `r` (radius/size) config — plot-level only, consumed via {@link AxisBasedScalesConfig.r}. */
export type RScaleConfig = {
	domain?: [number, number];
	/** Pixel radius range, e.g. `[2, 20]`. Defaults to svelteplot's own. */
	range?: [number, number];
};

/** `length` (vector/spike magnitude) config — plot-level only, consumed via `GeoScalesConfig.length`. */
export type LengthScaleConfig = {
	domain?: [number, number];
	/** Pixel length range, e.g. `[0, 60]`. Defaults to svelteplot's own. */
	range?: [number, number];
};

// ── Axis channels (x/y) ───────────────────────────────────────────────────────
// `x`/`y` are channels in every sense that matters (a per-row accessor,
// resolved into `channels.x`/`channels.y` in each plot kind's own mapping
// phase), but need the same one-shared-scale guarantee as `r`/`length`
// above — putting them in `ChannelScalesConfig` would misleadingly suggest a
// marker's own `scales.x` could diverge from the plot's. It can't.

/** Scale types that lay out distinct categories — an axis paired with one plays the "index" role, so the other is the plain magnitude/value axis. */
export const DISCRETE_SCALE_TYPES = ['band', 'categorical', 'point', 'ordinal'] as const;
export type DiscreteScaleType = (typeof DISCRETE_SCALE_TYPES)[number];

/** Scale types that lay out a continuous time axis. */
export const TEMPORAL_SCALE_TYPES = ['time', 'utc'] as const;
export type TemporalScaleType = (typeof TEMPORAL_SCALE_TYPES)[number];

/** Scale types that map a numeric domain continuously onto the range, differing only in the transform applied (identity, power, log, ...). */
export const CONTINUOUS_SCALE_TYPES = ['linear', 'pow', 'sqrt', 'log', 'symlog'] as const;
export type ContinuousScaleType = (typeof CONTINUOUS_SCALE_TYPES)[number];

/** Scale types that interpolate continuously along a single ramp (one end to the other, or around a cycle). */
export const SEQUENTIAL_SCALE_TYPES = ['sequential', 'cyclical', 'quantile-cont'] as const;
export type SequentialScaleType = (typeof SEQUENTIAL_SCALE_TYPES)[number];

/** Scale types that interpolate continuously along a ramp with a neutral midpoint, diverging to either side of it. */
export const DIVERGING_SCALE_TYPES = [
	'diverging',
	'diverging-log',
	'diverging-pow',
	'diverging-sqrt',
	'diverging-symlog'
] as const;
export type DivergingScaleType = (typeof DIVERGING_SCALE_TYPES)[number];

/** Scale types that bucket a numeric domain into a fixed set of output values instead of interpolating. */
export const BINNED_SCALE_TYPES = ['threshold', 'quantile', 'quantize'] as const;
export type BinnedScaleType = (typeof BINNED_SCALE_TYPES)[number];

/**
 * Author-facing scale overrides for a plot axis. Mirrors svelteplot's
 * `ScaleOptions` + `XScaleOptions` in full — `type`, `padding`, `domain`,
 * `nice`, `reverse`, `label`, `tickFormat`, `labelAnchor`, etc.
 *
 * Used for both `x` and `y` entries in `ScalesConfig`. X-specific
 * fields (`labelAnchor`, `tickRotate`) are accepted on `y` too; svelteplot
 * silently ignores any inapplicable options.
 *
 * `TData` is the plot's own row type — it's what {@link AxisScale.sort}
 * receives, so ordering isn't limited to comparing this axis's own value.
 */
export type AxisScale<TData = Record<string, unknown>> = {
	type?:
		| 'auto'
		| ContinuousScaleType
		| TemporalScaleType
		| DiscreteScaleType
		| SequentialScaleType
		| DivergingScaleType
		| BinnedScaleType;
	domain?: (number | string | boolean | Date | null)[];
	range?: (number | string | boolean | Date | null)[];
	reverse?: boolean;
	label?: string | false;
	labelAnchor?: 'auto' | 'left' | 'center' | 'right' | 'bottom' | 'middle' | 'top';
	labelOrientation?: 'horizontal' | 'vertical';
	labelPosition?: 'top' | 'middle';
	titleFontSize?: number;
	interval?: string | number;
	clamp?: boolean;
	nice?: boolean;
	zero?: boolean;
	round?: boolean;
	percent?: boolean;
	align?: number;
	base?: number;
	constant?: number;
	sort?: (a: TData, b: TData) => number;
	grid?:
		| boolean
		| { stroke?: string; strokeWidth?: number; strokeOpacity?: number; strokeDasharray?: string };
	padding?: number;
	paddingInner?: number;
	paddingOuter?: number;
	insetLeft?: number;
	insetRight?: number;
	insetTop?: number;
	insetBottom?: number;
	ticks?: (number | string | boolean | Date | null)[];
	tickSpacing?: number;
	tickSize?: number;
	tickPadding?: number;
	tickRotate?: number;
	tickFormat?:
		| false
		| Intl.NumberFormatOptions
		| Intl.DateTimeFormatOptions
		| ((d: unknown, index: number, ticks: unknown[]) => string | string[]);
};

export type AxisChannelName = 'x' | 'y';

/** Each {@link AxisChannelName}'s own scale-config shape — both use {@link AxisScale}. */
export type AxisChannelScaleConfig<TData = Record<string, unknown>> = {
	[K in AxisChannelName]?: AxisScale<TData>;
};

// ── Combined per-plot-kind scales config ─────────────────────────────────────

/**
 * Per-axis scale overrides, passed as a single `scales` prop to every
 * axis-based plot kind (`GeoPlot` uses `GeoScalesConfig` instead — a map has
 * no x/y axis pair, and its own plot-wide channel is `length`, not `r`).
 * `TData` threads through to {@link AxisScale.sort} on each axis.
 */
export type AxisBasedScalesConfig<TData = Record<string, unknown>> =
	AxisChannelScaleConfig<TData> & {
		r?: RScaleConfig;
	} & ChannelScalesConfig;
