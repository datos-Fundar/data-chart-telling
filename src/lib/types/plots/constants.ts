/**
 * Where something sits in a box, in a frame or on a shape: its middle, against one of its edges as they are drawn on
 * the page, or in one of its corners. The anchors of a text marker's `frameAnchor`, and of a shape's `label`.
 */
export type LabelAnchor =
	| 'middle'
	| 'top'
	| 'bottom'
	| 'left'
	| 'right'
	| 'top-left'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-right';

/**
 * Where a value label sits on its mark. Two vocabularies share the type, one per family of plots:
 *
 * - The plots that label a point or the end of a line (`LinePlot`, `AreaPlot`, `SlopePlot`, `ScatterPlot`...) read
 *   the side of the point its text is written on: `'start'` after it (right of a line's last point), `'end'` before
 *   it, `'middle'` on it and `'outside'` beyond it.
 * - The plots that label a shape (`BarPlot`, `BulletPlot`, `PyramidPlot`, `HistogramPlot`) read where in it the
 *   label is. Inside the shape: a {@link LabelAnchor} - its `'middle'`, an edge as it is drawn on the page
 *   (`'top'`, `'left'`...) or a corner (`'top-left'`...) - or, whichever side of zero the value is, the end of the bar
 *   away from zero, `'tip'`, or the one at zero, `'base'`. Beyond the tip, outside the shape: `'outside'`.
 */
export type ValueAnchor = LabelAnchor | 'outside' | 'start' | 'end' | 'tip' | 'base';

/**
 * Shared by two unrelated renderers: a `dot` mark's own point shape
 * (delegated to svelteplot/d3-shape) and a discrete legend item's own icon
 * (`DiscreteSymbolIcon.svelte`, the same shape fitted to the icon). `'line'` is legend-only - it represents
 * a Line series' own swatch there, but isn't a real d3-shape symbol name, so
 * a `dot` mark (or the `symbol` channel) given `'line'` renders as
 * `'circle'` instead.
 */
export type SymbolType = 'circle' | 'square' | 'triangle' | 'line' | 'diamond' | 'star' | 'cross';
export type LineStyle = 'solid' | 'dashed' | 'dotted' | 'dashdot';
export type LineCap = 'butt' | 'round' | 'square';
export type LineJoin = 'arcs' | 'bevel' | 'miter' | 'miter-clip' | 'round';

/** `font-weight` accepted by any text styling: a keyword, or a numeric weight (100-900). */
export type FontWeight = 'normal' | 'bold' | number;

/** `font-style` keyword accepted by any text styling. */
export type FontStyleKeyword = 'normal' | 'italic';

/**
 * Horizontal text anchor. `'outside'` leaves the side to the mark that writes
 * the label, where it picks one per point (a Cleveland plot's labels take
 * their own); elsewhere it's treated the same as `'start'`.
 */
export type TextAnchor = 'start' | 'middle' | 'end' | 'outside';

/** Vertical text anchor. */
export type LineAnchor = 'top' | 'middle' | 'bottom';
