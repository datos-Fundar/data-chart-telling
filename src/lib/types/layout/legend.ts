import type { Snippet } from 'svelte';
import type { SvelteMap } from 'svelte/reactivity';
import type { SymbolType, LineStyle } from '$lib/types/plots/constants';
import type { StrokeStyle, DotStyle } from '$lib/types/plots/styling';

export type LegendSectionType = 'discrete' | 'continuous';

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
	symbol?: SymbolType;
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
	columns?: number;
	min: number;
	max: number;
	colorMin?: string;
	colorMax?: string;
	ticks?: number[];
	width?: number;
	format?: (v: number) => string;
	interactive?: ContinuousInteractiveConfig;
};

export type LegendSection = DiscreteLegendSection | ContinuousLegendSection;

/** Legend state shared by every plot and legend under one provider: what is turned off. */
export type LegendInteractionStore = {
	/** Legend item name → action to apply. Presence in the map means "disabled". */
	disabledSeries: SvelteMap<string, LegendDisabledAction>;
	/** The narrowed range of the first interactive continuous section, or `null`. */
	continuousRange: {
		min: number;
		max: number;
		mode: 'rescale' | 'filter';
		disabledStyle: LegendDisabledStyle;
	} | null;
};
