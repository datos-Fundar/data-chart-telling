import type { SymbolType } from '$lib/types/plots/constants';
import type { AxisChannelName, IndependentChannelName } from '$lib/types/layout/mapping';

// ── Per-consumer channels: each consumer resolves its own ramp ───────────────

/** A continuous or categorical color ramp. */
export type ColorScaleConfig = {
	/** `[min, max]` for a continuous ramp, or the category list for a categorical one. Auto-computed from the data when omitted. */
	domain?: [number, number] | string[];
	/**
	 * A named d3-scale-chromatic ramp (e.g. `'turbo'`, `'blues'`, `'rdylbu'` -
	 * case-insensitive), 2+ literal colors interpolated across `domain`, or a
	 * category → color map. Defaults to the theme's own 2-color ramp.
	 */
	scheme?: string | string[] | Record<string, string>;
	/** Splits an array `scheme` into two halves meeting at this domain value (diverging). Ignored for a `Record` scheme. */
	pivot?: number;
	/** Fallback color for a missing/unmapped value. Defaults to `'#ccc'`. */
	unknown?: string;
};

/** How groups sharing the same `grouping`/`color` value are ordered: `reverse` flips which sorts first (e.g. PyramidPlot's left/right sides). */
export type GroupingScaleConfig = {
	reverse?: boolean;
};

/** A continuous or categorical opacity ramp - maps a value to a numeric `[0,1]`-ish opacity instead of a color. */
export type OpacityScaleConfig = {
	/** `[min, max]` for a continuous ramp, or the category list for a categorical one. Auto-computed from the data when omitted. */
	domain?: [number, number] | string[];
	/** `[minOpacity, maxOpacity]` for continuous, or a category → opacity map. Defaults to the theme's own `continuous.opacityRange`. */
	range?: [number, number] | Record<string, number>;
	/** Fallback opacity for a missing/unmapped value. Defaults to `1`. */
	unknown?: number;
};

/** A categorical shape ramp - maps distinct values to marker shapes. Always discrete. */
export type SymbolScaleConfig = {
	domain?: string[];
	/** Shapes cycled through in `domain` order, or a category → shape map. Defaults to a built-in cycle. */
	range?: SymbolType[] | Record<string, SymbolType>;
	unknown?: SymbolType;
};

/** Each independent channel's scale config, on a plot's `scales` and a marker's own. */
export type ChannelScaleConfig = {
	color: ColorScaleConfig;
	grouping: GroupingScaleConfig;
	opacity: OpacityScaleConfig;
	symbol: SymbolScaleConfig;
};

/** `scales.<channel>` for every channel in `TChannel` - the shared shape for both a plot's own `scales` prop and a marker's own. */
export type ChannelScalesConfig<TChannel extends IndependentChannelName = IndependentChannelName> =
	{
		[K in TChannel]?: ChannelScaleConfig[K];
	};

// ── Plot-wide channels: one svelteplot scale shared by every mark ───────────

/** `r` (radius/size) config - plot-level only, consumed via {@link AxisBasedScalesConfig.r}. */
export type RScaleConfig = {
	domain?: [number, number];
	/** Pixel radius range, e.g. `[2, 20]`. Defaults to svelteplot's own. */
	range?: [number, number];
};

/** `length` (vector/spike magnitude) config - plot-level only. */
export type LengthScaleConfig = {
	domain?: [number, number];
	/** Pixel length range, e.g. `[0, 60]`. Defaults to svelteplot's own. */
	range?: [number, number];
};

// ── Axis channels (x/y): one scale shared by every mark ─────────────────────

/** Scale types that lay out distinct categories - an axis paired with one plays the "index" role, so the other is the plain magnitude/value axis. */
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
 * What an axis does when the tick at the data's first or last value would
 * crowd the nice tick next to it: `'drop-nice'` keeps the data's tick and
 * drops the nice one, `'drop-edge'` keeps the nice tick and drops the data's,
 * `'extend'` widens the axis to the next nice tick past the data.
 */
export type EdgeTickCollision = 'drop-nice' | 'drop-edge' | 'extend';

/** Whether an axis adds ticks at the data's first and last values, and what it does when one crowds a nice tick. */
export type EdgeTicksOptions = { enabled: boolean; collision: EdgeTickCollision };

/**
 * Scale overrides for one plot axis - svelteplot's `ScaleOptions` and
 * `XScaleOptions`, plus this package's own fields. `TData` is the row type
 * {@link AxisScale.sort} compares.
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
	niceTolerance?: number;
	edgeTicks?: boolean | { collision?: EdgeTickCollision };
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
	/** Whether the axis' ticks and title draw: `'hidden'` keeps their space (so aligned panels stay aligned), `'none'` gives it back. Defaults to `'visible'`. */
	axisDisplay?: 'visible' | 'hidden' | 'none';
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

/** Each {@link AxisChannelName}'s own scale-config shape - both use {@link AxisScale}. */
export type AxisChannelScaleConfig<TData = Record<string, unknown>> = {
	[K in AxisChannelName]?: AxisScale<TData>;
};

// ── Combined per-plot-kind scales config ─────────────────────────────────────

/** The `scales` prop of every axis-based plot kind. */
export type AxisBasedScalesConfig<TData = Record<string, unknown>> =
	AxisChannelScaleConfig<TData> & {
		r?: RScaleConfig;
		length?: LengthScaleConfig;
	} & ChannelScalesConfig;
