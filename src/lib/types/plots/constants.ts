/**
 * Unified positional anchor for value labels across all plot kinds.
 *
 * - `'outside'` - beyond the tip of the mark (above a vertical bar, to the
 *   far end of a horizontal bar or line). This is the only value with no
 *   direct svelteplot equivalent; the plot computes dx/dy internally.
 * - `'start'` - at the tip of the mark, just inside (top of a bar, far end
 *   of a pyramid bar from zero, right of a line's last point).
 * - `'middle'` - centred on the mark.
 * - `'end'` - at the baseline/zero end of the mark.
 */
export type ValueAnchor = 'outside' | 'start' | 'middle' | 'end';

/**
 * Shared by two unrelated renderers: a `dot` mark's own point shape
 * (delegated to svelteplot/d3-shape) and a discrete legend item's own icon
 * (`DiscreteSymbolIcon.svelte`, hand-drawn SVG, independent of svelteplot).
 * `'line'` is legend-only - it represents a Line series' own swatch there,
 * but isn't a real d3-shape symbol name, so a `dot` mark (or the `symbol`
 * channel) given `'line'` silently renders as `'circle'` instead (verified
 * against svelteplot's own symbol set). `'diamond'`/`'star'`/`'cross'` are
 * real d3-shape names, valid on a `dot` mark; the legend icon falls back to
 * a plain square for these since it has no hand-drawn icon for them yet.
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
 * Horizontal text anchor. `'outside'` is only meaningful where the consuming
 * mark resolves it per-point from a signed x value (currently `HoverMarker`
 * only) - it anchors the label away from zero: `'start'` (extending right)
 * for a positive x, `'end'` (extending left) for negative. Elsewhere it's
 * treated the same as `'start'`.
 */
export type TextAnchor = 'start' | 'middle' | 'end' | 'outside';

/** Vertical text anchor. */
export type LineAnchor = 'top' | 'middle' | 'bottom';
