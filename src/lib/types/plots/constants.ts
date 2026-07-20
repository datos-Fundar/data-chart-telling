/**
 * Unified positional anchor for value labels across all plot kinds.
 *
 * - `'outside'` — beyond the tip of the mark (above a vertical bar, to the
 *   far end of a horizontal bar or line). This is the only value with no
 *   direct svelteplot equivalent; the plot computes dx/dy internally.
 * - `'start'` — at the tip of the mark, just inside (top of a bar, far end
 *   of a pyramid bar from zero, right of a line's last point).
 * - `'middle'` — centred on the mark.
 * - `'end'` — at the baseline/zero end of the mark.
 */
export type ValueAnchor = 'outside' | 'start' | 'middle' | 'end';

export type SymbolType = 'circle' | 'square' | 'triangle' | 'line';
export type LineStyle = 'solid' | 'dashed' | 'dotted' | 'dashdot';
export type LineCap = 'butt' | 'round' | 'square';
export type LineJoin = 'arcs' | 'bevel' | 'miter' | 'miter-clip' | 'round';

/** `font-weight` keyword accepted by any text styling. */
export type FontWeight = 'normal' | 'bold';

/** `font-style` keyword accepted by any text styling. */
export type FontStyleKeyword = 'normal' | 'italic';

/**
 * Horizontal text anchor. `'outside'` is only meaningful where the consuming
 * mark resolves it per-point from a signed x value (currently `HoverMarker`
 * only) — it anchors the label away from zero: `'start'` (extending right)
 * for a positive x, `'end'` (extending left) for negative. Elsewhere it's
 * treated the same as `'start'`.
 */
export type TextAnchor = 'start' | 'middle' | 'end' | 'outside';

/** Vertical text anchor. */
export type LineAnchor = 'top' | 'middle' | 'bottom';
