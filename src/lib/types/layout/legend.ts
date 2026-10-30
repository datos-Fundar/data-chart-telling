import type { Snippet } from 'svelte';
import type { SymbolType, LineStyle } from '$lib/types/plots/constants';
import type { StrokeStyle, DotStyle } from '$lib/types/plots/styling';
import type {
	ColorScaleConfig,
	OpacityScaleConfig,
	SymbolScaleConfig
} from '$lib/types/layout/scales';

export type LegendSectionType = 'discrete' | 'continuous' | 'size' | 'symbol';

/**
 * Style for whatever a legend has turned off: a toggled-off series, or a row
 * outside a continuous range. `opacity` is the fallback for every
 * `*Opacity` field left unset.
 */
export type LegendDisabledStyle = {
	opacity?: number;
	stroke?: StrokeStyle;
	dots?: DotStyle;
	fill?: string;
	fillOpacity?: number;
};

/**
 * What a legend toggle does to a series once it's off: `'dim'` dims it in
 * place (styled by `style`), `'hide'` makes it fully transparent while the
 * axes keep its range, `'omit'` removes it from the plot entirely, rescaling
 * the axes to what's left.
 */
export type LegendDisabledAction =
	| { mode: 'dim'; style?: LegendDisabledStyle }
	| { mode: 'hide' }
	| { mode: 'omit' };

export type LegendItem = {
	name: string;
	label?: string;
	color?: string;
	/** How the series draws; with no `symbol`, `legend.icon.marks` picks the icon from it. */
	mark?: LegendMark;
	symbol?: SymbolType;
	/** Whether the symbol is filled, or drawn as an outline. Defaults to `true`. */
	filled?: boolean;
	opacity?: number;
	lineStyle?: LineStyle;
	/** Initial toggled-off state (uncontrolled - the user can still click it back on). */
	disabled?: boolean;
};

/**
 * How a discrete section's items flow: `'vertical'` in a `columns`-wide grid,
 * `'horizontal'` in rows paginated past `maxRows` (default 1), `'flex'` in
 * wrapping rows.
 */
export type LegendItemsLayout =
	| { type: 'vertical' }
	| { type: 'horizontal'; maxRows?: number }
	| { type: 'flex' };

export type LegendNavDirection = 'prev' | 'next';
export type LegendNavContext = {
	direction: LegendNavDirection;
	disabled: boolean;
	onclick: () => void;
};
/** Custom prev/next button renderer for a paginated horizontal section. Falls back to a small default arrow button. */
export type LegendNavSnippet = Snippet<[LegendNavContext]>;

export type LegendHandleWhich = 'lo' | 'hi';
export type LegendHandleContext = {
	which: LegendHandleWhich;
	/** The handle's current data value. */
	value: number;
	/** The handle's position along the bar, from 0 to 1. */
	position: number;
	onpointerdown: (event: PointerEvent) => void;
	ondoubleclick: () => void;
};
/** Custom drag-handle renderer for an interactive continuous section. */
export type LegendHandleSnippet = Snippet<[LegendHandleContext]>;

/** Item look of an interactive discrete section: `'badge'` (default) pills with an eye toggle, or `'basic'` swatches. */
export type LegendInteractiveStyle = 'badge' | 'basic';

/** Click-to-toggle configuration for a discrete section: whether it's on, how toggled items look, and the style applied to a toggled-off one. */
export type DiscreteInteractiveConfig = {
	/** Turns click-to-toggle on for every item in the section. */
	enabled?: boolean;
	/** Item look while `enabled`. Defaults to `'badge'`. */
	legendStyle?: LegendInteractiveStyle;
	/** What happens to a toggled-off item. Defaults to `{ mode: 'dim' }`. */
	disabled?: LegendDisabledAction;
	/** Shows the symbol icon inside a `'badge'` pill. Defaults to `true`; ignored by `'basic'`, which always shows it. */
	showIcon?: boolean;
};

export type DiscreteLegendSection = {
	type: 'discrete';
	title?: string;
	items: LegendItem[];
	columns?: number;
	/** Item flow direction. Defaults to horizontal for a lone section, vertical once there's more than one. */
	layout?: LegendItemsLayout;
	interactive?: DiscreteInteractiveConfig;
	navButton?: LegendNavSnippet;
};

/** Drag-to-narrow configuration for a continuous section: whether it's on, how the range behaves, and its look. */
export type ContinuousInteractiveConfig = {
	/** Turns drag-to-narrow on, adding lo/hi handles at the edges of the excluded range. */
	enabled?: boolean;
	/** `'rescale'` refits the color ramp to the narrowed range; `'filter'` (default) keeps it and hides what's outside. */
	mode?: 'rescale' | 'filter';
	/** Style applied to the excluded (narrowed-out) range. Defaults to `{ opacity: cfg.legend.disabledOpacity }`. */
	disabledStyle?: LegendDisabledStyle;
	/** Custom renderer for the draggable lo/hi handles. */
	handle?: LegendHandleSnippet;
};

export type ContinuousLegendSection = {
	type: 'continuous';
	title?: string;
	/** The channel the section reads, which tells apart automatic sections that share a title. */
	channel?: Exclude<LegendChannel, 'series'>;
	columns?: number;
	min: number;
	max: number;
	colorMin?: string;
	colorMax?: string;
	/** A named ramp (e.g. `'turbo'`) or 2+ colors to draw the bar in, over `colorMin`/`colorMax`. */
	scheme?: string | string[];
	/** Splits an array `scheme` into two halves meeting at this value (diverging). */
	pivot?: number;
	/** Draws the bar in one color (`colorMin`, `legend.continuous.opacity.color` by default) fading across this opacity range over a checkerboard, instead of a color ramp. */
	opacity?: [number, number];
	ticks?: number[];
	width?: number;
	format?: (v: number) => string;
	interactive?: ContinuousInteractiveConfig;
};

/**
 * A continuous size scale - the `r` channel of a plot's dots: a few dots of
 * the radius each value draws at, its value under each. `domain` maps to
 * `range` (px) on a square-root scale, so a dot's area follows its value.
 */
export type SizeLegendSection = {
	type: 'size';
	title?: string;
	/** The channel the section reads, which tells apart automatic sections that share a title. */
	channel?: Exclude<LegendChannel, 'series'>;
	columns?: number;
	domain: [number, number];
	range: [number, number];
	/** The values shown, one dot each. Defaults to a few round values across `domain`. */
	values?: number[];
	/** The dots' color. Defaults to the text color. */
	color?: string;
	/** Whether the dots are filled, or drawn as rings. Defaults to `true`. */
	filled?: boolean;
	/** The dots' shape. Defaults to `'circle'`. */
	symbol?: SymbolType;
	/** How each value reads. Defaults to the axes' own format (`axis.locale`, `axis.compactDisplay`). */
	format?: (v: number) => string;
};

/**
 * A categorical shape scale - the `symbol` channel of a plot's dots: each
 * category next to the shape it draws as. Unlike a discrete section, its
 * items name categories, not series, so they never toggle.
 */
export type SymbolLegendSection = {
	type: 'symbol';
	title?: string;
	/** The channel the section reads, which tells apart automatic sections that share a title. */
	channel?: Exclude<LegendChannel, 'series'>;
	columns?: number;
	/** Item flow direction, as in a discrete section. */
	layout?: LegendItemsLayout;
	items: { name: string; label?: string; symbol: SymbolType }[];
	/** The shapes' color. Defaults to the text color. */
	color?: string;
	/** Whether the shapes are filled, or drawn as outlines. Defaults to `true`. */
	filled?: boolean;
};

export type LegendSection =
	| DiscreteLegendSection
	| ContinuousLegendSection
	| SizeLegendSection
	| SymbolLegendSection;

/** The narrowed range of an interactive continuous section: rows outside it dim, or the ramp refits to it. */
export type LegendRange = {
	min: number;
	max: number;
	mode: 'rescale' | 'filter';
	disabledStyle: LegendDisabledStyle;
};

/** How a series draws, as a legend shows it: the plot's own mark for it. */
export type LegendMark = 'line' | 'dot' | 'area' | 'bar' | 'cell' | 'rect' | 'geo';

/**
 * What a plot draws that a legend can show - registered on the figure's
 * `LegendState` as the plot resolves: a series (its name, color and how it
 * draws), a segment or marker that names itself on the legend (`'mark'`), a
 * continuous color scale (the domain its colors span), the opacity scale
 * its marks fade across, the size scale its
 * dots' `r` channel draws with, or the shapes its dots' `symbol` channel
 * draws each category as.
 */
export type LegendEntry =
	| {
			type: 'series' | 'mark';
			name: string;
			label?: string;
			color?: string;
			mark?: LegendMark;
			symbol?: SymbolType;
			filled?: boolean;
			lineStyle?: LineStyle;
	  }
	| {
			type: 'size';
			channel: 'r';
			title?: string;
			domain: [number, number];
			range: [number, number];
			color?: string;
			filled: boolean;
			symbol?: SymbolType;
	  }
	| {
			type: 'symbol';
			channel: 'symbol';
			title?: string;
			items: { name: string; symbol: SymbolType }[];
			color?: string;
			filled: boolean;
	  }
	| {
			type: 'scale';
			channel: 'color';
			title?: string;
			min: number;
			max: number;
			colorMin?: string;
			colorMax?: string;
			scheme?: string | string[];
			pivot?: number;
	  }
	| {
			type: 'opacity';
			channel: 'opacity';
			title?: string;
			min: number;
			max: number;
			/** The opacity at `min` and at `max`. */
			opacityMin: number;
			opacityMax: number;
			/** The color the marks draw in. Defaults to the text color. */
			color?: string;
	  };

/**
 * How a segment or marker shows on its plot's automatic legend: its label, or
 * the item itself. What the item leaves out - its color, its symbol, its line
 * style - comes from how the segment or marker draws.
 */
export type MarkLegend = string | (Omit<LegendItem, 'name' | 'disabled'> & { label: string });

/** What a legend reads each automatic section from: the series, or the channel a scale encodes - named as the plot's own prop (`r` for sizes). */
export type LegendChannel = 'series' | 'color' | 'opacity' | 'r' | 'symbol';

/**
 * How to adjust one automatic section: its own configuration, minus what the
 * plots compute for it. An entry with a `match` (one, or several in a list) adjusts
 * only the sections titled so - by the field or function name, or as the
 * legend shows it - and one without adjusts all of that channel's.
 */
export type LegendOverride<TSection extends { type: string }, TComputed extends string> =
	| (Omit<TSection, 'type' | TComputed> & { match?: string })
	| (Omit<TSection, 'type' | TComputed> & { match?: string })[];

/**
 * How to adjust what a `color` channel draws: the continuous section of a
 * numeric one, or the discrete section of series a categorical one makes. It
 * takes what both sections share, plus each one's own - what a section lacks
 * is ignored. `interactive` takes either section's options.
 */
export type ColorOverride = Omit<
	ContinuousLegendSection,
	'type' | 'min' | 'max' | 'colorMin' | 'colorMax' | 'scheme' | 'pivot' | 'opacity' | 'interactive'
> &
	Pick<DiscreteLegendSection, 'layout' | 'navButton'> & {
		interactive?: ContinuousInteractiveConfig & DiscreteInteractiveConfig;
		/** Adjusts only the continuous section titled so. */
		match?: string;
	};

/**
 * What a figure adds to, or changes in, its automatic legend, keeping what
 * its plots read as: `items` after the plots' own series, in the same
 * section, `sections` after the automatic ones, and one key per channel to
 * adjust the section that channel draws - `series` the discrete section,
 * `color` and `opacity` the continuous ones, `size` and `symbol` theirs. A
 * categorical `color` is the series, so `color` adjusts the discrete section
 * too (`series` wins where both set the same). Only `color` can make a
 * ramp `interactive`, and only its first ramp is.
 */
export type LegendExtension = {
	/**
	 * Series to turn off from code, as if the reader had clicked them: a list
	 * of names (each dimmed, to `legend.disabledOpacity`), or a name → what
	 * turning it off does map - an opacity to dim to, or a full
	 * {@link LegendDisabledAction} (`dim`, `hide` or `omit`). It follows the
	 * value it is given: a series left out is turned back on. One the reader
	 * turned off themselves is left as it is.
	 */
	off?: string[] | Record<string, number | LegendDisabledAction>;
	/**
	 * The series to keep on: every other series is dimmed, the inverse of
	 * listing the rest in `off`. An entry of `off` for a series wins.
	 */
	highlight?: string | string[];
	items?: LegendItem[];
	sections?: LegendSection[];
	series?: Omit<DiscreteLegendSection, 'type' | 'items'>;
	color?: ColorOverride | ColorOverride[];
	opacity?: LegendOverride<
		ContinuousLegendSection,
		'min' | 'max' | 'colorMin' | 'colorMax' | 'scheme' | 'pivot' | 'opacity' | 'interactive'
	>;
	r?: LegendOverride<SizeLegendSection, 'domain' | 'range' | 'color' | 'filled' | 'symbol'>;
	symbol?: LegendOverride<SymbolLegendSection, 'items' | 'color' | 'filled'>;
};

/** A segment or marker as the legend reads it: whether it names itself, the channels it draws with and the colors it draws in. */
export type LegendSource = {
	type?: string;
	series?: string;
	data?: unknown[];
	color?: unknown;
	opacity?: unknown;
	r?: unknown;
	symbol?: unknown;
	scales?: {
		color?: ColorScaleConfig;
		opacity?: OpacityScaleConfig;
		symbol?: SymbolScaleConfig;
	};
	legend?: MarkLegend | false;
	fill?: unknown;
	stroke?: unknown;
	styles?: {
		fill?: unknown;
		stroke?: unknown;
		dotFill?: unknown;
		dotStroke?: unknown;
		dotSymbol?: unknown;
		strokeDasharray?: unknown;
	};
};

/** What a plot hands the legend to read its entries from. */
export type LegendPlot = {
	resolvedSeries?: { name: string; data?: unknown[] }[];
	colorForSeries?: (name: string) => string;
	markers?: LegendSource[];
	segments?: Record<string, LegendSource[] | undefined>;
	/** The `[min, max]` a plot-level color ramp spans, when the plot has no `color` channel to read it from. */
	colorDomain?: [number, number];
	/** The ramps of the segments that set their own color scale, each over its own features' values. */
	colorRamps?: {
		name: string;
		domain: [number, number];
		scale: { scheme?: unknown; pivot?: number };
	}[];
	/** The `[min, max]` of a plot-level numeric `opacity` channel. */
	opacityDomain?: [number, number];
	channels?: {
		r?: { source?: unknown };
		symbol?: { source?: unknown };
		color?: { source?: unknown };
		opacity?: { source?: unknown };
	};
	scales?: {
		r?: { domain?: [number, number]; range?: [number, number] };
		color?: { domain?: unknown; scheme?: unknown; pivot?: number };
		opacity?: OpacityScaleConfig;
	};
};
