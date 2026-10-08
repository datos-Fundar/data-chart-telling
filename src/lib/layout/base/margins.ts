export const AUTO_MARGIN_ESTIMATE = { top: 20, right: 20, bottom: 30, left: 40 } as const;

/**
 * A margin side as a number: the side itself, or `estimate` (default
 * `AUTO_MARGIN_ESTIMATE`) when it is `'auto'`.
 */
export function numericMargin(
  side: keyof typeof AUTO_MARGIN_ESTIMATE,
  value: number | 'auto' | undefined,
  estimate: Record<keyof typeof AUTO_MARGIN_ESTIMATE, number> = AUTO_MARGIN_ESTIMATE,
): number {
  return typeof value === 'number' ? value : estimate[side];
}
