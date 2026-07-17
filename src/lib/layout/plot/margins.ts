export const AUTO_MARGIN_ESTIMATE = { top: 20, right: 20, bottom: 30, left: 40 } as const;

/**
 * GeoPlot's own margin default — a small, uniform gap on every side, unlike
 * `AUTO_MARGIN_ESTIMATE`'s asymmetric axis-tick-label estimate (extra room
 * on the left/bottom for y tick labels and an x-axis title). A map has no
 * axes to make room for, so borrowing that estimate just left GeoPlot with
 * a lopsided, oversized margin — most visibly a much taller gap under the
 * map than an `inset` marker's own default `margin` (see `insetLayout.ts`),
 * even though both are meant to read as the same edge gap. Matching this
 * constant to that 8px inset default keeps the two visually aligned.
 */
export const GEO_MARGIN_ESTIMATE = { top: 8, right: 8, bottom: 8, left: 8 } as const;

/**
 * Best-effort numeric fallback for a margin side that resolved to `'auto'`.
 * Used for layout heuristics that need *a* number before svelteplot has
 * measured the real rendered content (tick labels, axis title) — e.g.
 * capping tick count, or estimating a band's pixel width for the bar plot's
 * 'grouped' series layout. Not exact: an `'auto'` side can end up wider than
 * this once svelteplot measures unusually long tick labels.
 *
 * `estimate` defaults to `AUTO_MARGIN_ESTIMATE`; pass `GEO_MARGIN_ESTIMATE`
 * for GeoPlot, which has no axes for that estimate's asymmetry to apply to.
 */
export function numericMargin(
  side: keyof typeof AUTO_MARGIN_ESTIMATE,
  value: number | 'auto' | undefined,
  estimate: Record<keyof typeof AUTO_MARGIN_ESTIMATE, number> = AUTO_MARGIN_ESTIMATE,
): number {
  return typeof value === 'number' ? value : estimate[side];
}
