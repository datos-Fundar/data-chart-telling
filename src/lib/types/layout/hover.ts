import type { AxisValue } from '$lib/types/layout/mapping';

/**
 * How the hover highlight finds related points within a facet.
 * - `'x'` all points sharing the hovered x (default for line / bar).
 * - `'y'` all points sharing the hovered y (default for pyramid).
 * - `'punctual'` exact XY match - one cell at a time (default for heatmap).
 * - `'series'` all points sharing the hovered series, regardless of x/y.
 */
export type HoverStrategy = 'x' | 'y' | 'punctual' | 'series';

/** Hover state shared by every plot under one figure - see `HoverState`. */
export type HoverStore = {
	activeX: AxisValue | null;
	activeY: AxisValue | null;
	/** Series of the hovered row, when the plot kind has a series concept (line/bar). */
	activeSeries: string | null;
	/** The cursor's position in the source plot's box, as fractions of its width and height. */
	cursorFrac: { x: number; y: number } | null;
	/** Facet id that currently owns the hover (`''` when not faceted). */
	source: string | null;
	/** How related points are found within a facet. */
	strategy: HoverStrategy;
	/** Whether the hover is broadcast to other facets. */
	sync: boolean;
};

/** A slice of a category band, as start/end fractions (0-1) of the whole band. */
export type BandSlice = { start: number; end: number };

/** A point ready to render: its plotted position plus its label. */
export type HoverDisplayPoint = {
	x: AxisValue;
	y: AxisValue;
	label: string;
	/** Owning series name; undefined for plot kinds with no series concept (heatmap). */
	series?: string;
	/** Resolved series color - used by HoverMarker when dotFill/fill is `'currentColor'`. */
	color?: string;
	/** A 'grouped' series' own slice of the category band, as start/end fractions (0-1) of the whole band. `undefined` means the whole band. */
	areaInset?: BandSlice;
};

/** A candidate point for hover matching/highlighting - also carries its source row. */
export type HoverPoint<T> = HoverDisplayPoint & {
	row: T;
};
