export const AUTO_MARGIN_ESTIMATE = { top: 20, right: 20, bottom: 30, left: 40 } as const;

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
