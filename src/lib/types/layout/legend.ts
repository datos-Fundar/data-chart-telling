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
 * How a discrete section's items flow. `'vertical'` (the default) stacks them
 * in a `columns`-wide grid, as it always has. `'horizontal'` flows them left
 * to right, wrapping to new rows as needed — and once wrapped rows exceed
 * `maxRows` (default 1), the section paginates instead of growing taller,
 * surfacing prev/next arrows to page through the rest.
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

export type DiscreteLegendSection = {
	type: 'discrete';
	title?: string;
	items: LegendItem[];
	columns?: number;
	/** Item flow direction. Defaults to `{ type: 'vertical' }` (unchanged prior behaviour). */
	layout?: LegendItemsLayout;
	interactive?: boolean;
	disabledStyle?: LegendDisabledStyle;
	navButton?: LegendNavSnippet;
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
	interactive?: boolean;
	/**
	 * How the color ramp responds to a narrowed range: `'rescale'` reprojects
	 * it onto the new bounds, `'filter'` keeps the original domain and only
	 * excludes out-of-range values. Defaults to `'filter'`.
	 */
	mode?: 'rescale' | 'filter';
	disabledStyle?: LegendDisabledStyle;
	/** Custom renderer for the draggable lo/hi handles. */
	handle?: LegendHandleSnippet;
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
	/** Legend item name → resolved style to apply. Presence in the map means "disabled". */
	disabledSeries: SvelteMap<string, LegendDisabledStyle>;
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
