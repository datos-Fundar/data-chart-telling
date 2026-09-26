import type { SymbolType } from '$lib/types/plots/constants';

export type AxisValue = number | string | Date;

/**
 * A continuous or categorical color ramp — this package resolves its own
 * (never svelteplot's shared `color` scale), so more than one ramp can
 * coexist in the same plot at different levels (`scales.color`, a `segments`
 * entry, a marker's own `scales`).
 */
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
 * relative to each other — a pseudo-channel of this package's own (not one
 * of svelteplot's scale options), configured via `scales.grouping` alongside
 * every other channel. `reverse` flips which group sorts first (e.g.
 * PyramidPlot's left/right side order); `seriesLayout`/`seriesPadding`
 * control how BarPlot arranges multiple series sharing the same category
 * (overlapping, side-by-side, or stacked).
 */
export type GroupingScaleConfig = {
	reverse?: boolean;
	seriesLayout?: 'overlap' | 'grouped' | 'stacked';
	seriesPadding?: number;
};

/**
 * A continuous or categorical opacity ramp — same resolution model as
 * {@link ColorScaleConfig} (this package resolves its own `value => opacity`
 * function per consumer), but maps to a numeric `[0,1]`-ish range instead of
 * colors. Unlike `color`, svelteplot has no "already resolved, don't rescale
 * me" escape hatch for a bare number (only a recognized CSS color string
 * gets that treatment) — every consumer of a resolved opacity value applies
 * it as a literal constant per mark instance rather than a per-row function,
 * to avoid svelteplot re-deriving its own domain from whatever a function
 * returns and silently re-normalizing it.
 */
export type OpacityScaleConfig = {
	/** `[min, max]` for a continuous ramp, or the category list for a categorical one. Auto-computed from the data when omitted. */
	domain?: [number, number] | string[];
	/** `[minOpacity, maxOpacity]` for continuous, or a category → opacity map. Defaults to the theme's own `continuous.opacityRange`. */
	range?: [number, number] | Record<string, number>;
	/** Fallback opacity for a missing/unmapped value. Defaults to `1`. */
	unknown?: number;
};

/**
 * A categorical shape ramp — maps distinct values to marker shapes. Always
 * discrete (there's no "shape between two shapes"), unlike every other
 * channel here. Resolves to a plain shape-name string, which svelteplot
 * recognizes as a literal (same escape hatch as a CSS color string for
 * `color`), so — unlike `opacity` — a per-row accessor function works
 * directly with no bucketing needed.
 */
export type SymbolScaleConfig = {
	domain?: string[];
	/** Shapes cycled through in `domain` order, or a category → shape map. Defaults to a built-in cycle. */
	range?: SymbolType[] | Record<string, SymbolType>;
	unknown?: SymbolType;
};

/**
 * Every secondary channel this package resolves — x/y stay kind-specific,
 * not part of this list. Add a channel here and to {@link ChannelScaleConfig}
 * and it's available in `scales.<channel>` on every axis-based plot kind,
 * and the same shape on a marker's own `scales`. `r` is deliberately not a
 * member of this list — see {@link RScaleConfig}'s own doc comment for why.
 */
export type ChannelName = 'color' | 'grouping' | 'opacity' | 'symbol';

/** Each {@link ChannelName}'s own scale-config shape. */
export type ChannelScaleConfig = {
	color: ColorScaleConfig;
	grouping: GroupingScaleConfig;
	opacity: OpacityScaleConfig;
	symbol: SymbolScaleConfig;
};

/**
 * `r` (radius/size) config — a plot-level-only setting, deliberately outside
 * {@link ChannelScalesConfig}'s per-consumer-independent mechanism. Unlike
 * `color`, svelteplot binds `r` to exactly one scale shared by every mark in
 * the plot (configured once, at `<Plot r={...}>` — there is no per-mark
 * equivalent), so a marker's own `scales.r` would still share the plot's own
 * scale rather than getting an independent one. `domain`/`range` here get
 * threaded straight into svelteplot's own `r` scale rather than resolved by
 * a from-scratch function, since svelteplot's own sqrt (area-proportional)
 * radius math is already correct — this only exposes author control over
 * its domain/range, it doesn't replace it.
 */
export type RScaleConfig = {
	domain?: [number, number];
	/** Pixel radius range, e.g. `[2, 20]`. Defaults to svelteplot's own. */
	range?: [number, number];
};

/** `scales.<channel>` for every channel in `TChannel` — the shared shape for both a plot's own `scales` prop and a marker's own. */
export type ChannelScalesConfig<TChannel extends ChannelName = ChannelName> = {
	[K in TChannel]?: ChannelScaleConfig[K];
};

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
		| 'linear'
		| 'pow'
		| 'sqrt'
		| 'log'
		| 'symlog'
		| 'time'
		| 'utc'
		| 'point'
		| 'ordinal'
		| 'sequential'
		| 'band'
		| 'categorical'
		| 'cyclical'
		| 'threshold'
		| 'quantile-cont'
		| 'quantile'
		| 'quantize'
		| 'diverging'
		| 'diverging-log'
		| 'diverging-pow'
		| 'diverging-sqrt'
		| 'diverging-symlog';
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

/**
 * Per-axis scale overrides, passed as a single `scales` prop to every
 * axis-based plot kind (`GeoPlot` uses `GeoScalesConfig` instead — a map has
 * no x/y axis pair). `TData` threads through to {@link AxisScale.sort} on
 * each axis. Also carries every channel in {@link ChannelScalesConfig}
 * (`color`, `grouping`, and whatever else is added there later).
 */
export type AxisBasedScalesConfig<TData = Record<string, unknown>> = {
	x?: AxisScale<TData>;
	y?: AxisScale<TData>;
	/** Plot-wide only — see {@link RScaleConfig}'s own doc comment for why this isn't part of {@link ChannelScalesConfig}. */
	r?: RScaleConfig;
} & ChannelScalesConfig;
