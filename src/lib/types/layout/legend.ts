import type { Snippet } from 'svelte';
import type { SvelteMap } from 'svelte/reactivity';
import type { SymbolType, LineStyle } from '$lib/types/plots/constants';
import type { StrokeStyle, DotStyle } from '$lib/types/plots/styling';

export type LegendSectionType = 'discrete' | 'continuous';

/**
 * Style applied to whatever a legend interaction has turned "off" — a
 * toggled-off discrete series, or a datapoint/cell/feature outside an active
 * continuous range filter. `opacity` is a blanket convenience: any
 * `*Opacity` field a consumer doesn't set falls back to it, so
 * `{ opacity: 0.1 }` alone is enough to read as "disabled" everywhere.
 */
export type LegendDisabledStyle = {
	opacity?: number;
	stroke?: StrokeStyle;
	dots?: DotStyle;
	fill?: string;
	fillOpacity?: number;
};

/** What a legend toggle does to a series once it's off: `'style'` dims it in place, `'omit'` removes it from the plot entirely. */
export type LegendDisabledAction = { mode: 'style'; style?: LegendDisabledStyle } | { mode: 'omit' };

export type LegendItem = {
	name: string;
	label?: string;
	color?: string;
	symbol?: SymbolType;
	opacity?: number;
	lineStyle?: LineStyle;
	/** Initial toggled-off state (uncontrolled — the user can still click it back on). */
	disabled?: boolean;
};

/**
 * How a discrete section's items flow. `'vertical'` stacks them in a
 * `columns`-wide grid; `'horizontal'` flows them left to right, paginating
 * past `maxRows` (default 1) with prev/next arrows.
 */
export type LegendItemsLayout = { type: 'vertical' } | { type: 'horizontal'; maxRows?: number };

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

/**
 * Item look for an interactive discrete section. `'badge'` (the default once
 * `interactive.enabled` is on) draws each item as a pill filled with its
 * series color, with the symbol icon and label auto-contrasted against that
 * fill and an eye icon on the right — crossed out once the item is toggled
 * off. `'basic'` keeps the plain swatch + label, same as a non-interactive
 * section.
 */
export type LegendInteractiveStyle = 'badge' | 'basic';

/** Click-to-toggle configuration for a discrete section: whether it's on, how toggled items look, and the style applied to a toggled-off one. */
export type DiscreteInteractiveConfig = {
	/** Turns click-to-toggle on for every item in the section. */
	enabled?: boolean;
	/** Item look while `enabled`. Defaults to `'badge'`. */
	legendStyle?: LegendInteractiveStyle;
	/** What happens to a toggled-off item. Defaults to `{ mode: 'style' }`. */
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
	/**
	 * How the color ramp responds to a narrowed range: `'rescale'` reprojects
	 * it onto the new bounds, `'filter'` keeps the original domain and only
	 * excludes out-of-range values. Defaults to `'filter'`.
	 */
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

/**
 * Shared legend-interaction state for cross-cutting legend → plot wiring.
 *
 * {@link BaseChart} provides one store via context (mirrors {@link HoverStore});
 * `DiscreteSection`/`ContinuousSection` write to it on click/drag, and every
 * plot kind (line/bar/pyramid/heatmap/geo) reads the same instance to know
 * what to dim. A standalone legend/plot with no provider falls back to its
 * own private store via `createLegendInteraction`.
 */
export type LegendInteractionStore = {
	/** Legend item name → action to apply. Presence in the map means "disabled". */
	disabledSeries: SvelteMap<string, LegendDisabledAction>;
	/**
	 * The active drag state of the (first) interactive continuous section, or
	 * `null` when none is interactive or the user hasn't narrowed it yet (full
	 * range — nothing hidden).
	 */
	continuousRange: {
		min: number;
		max: number;
		mode: 'rescale' | 'filter';
		disabledStyle: LegendDisabledStyle;
	} | null;
};

/** Read-only view of which series a legend has toggled off, resolved from {@link BaseChart}'s legend-interaction store. */
export type LegendPlotContext = {
	disabledSeries: ReadonlySet<string>;
	isDisabled: (name: string) => boolean;
};
