/**
 * How a hover in one facet propagates to the others.
 * - `none` — only the hovered facet reacts.
 * - `x`    — every facet highlights the point(s) sharing the hovered x.
 * - `y`    — …sharing the hovered y.
 * - `xy`   — …sharing both (a single matching point, e.g. one heatmap cell).
 */
export type TooltipSync = 'none' | 'x' | 'y' | 'xy';

/** Author-facing tooltip option on the chart kinds. `true` = enable with defaults. */
export type TooltipOptions<TRow extends Record<string, unknown>> = {
  sync?: TooltipSync;
  /** Custom tooltip text for a row (supports `\n`). Defaults per chart kind. */
  format?: (row: TRow) => string;
};

/** Either a bare on/off flag or the full option object. */
export type TooltipProp<TRow extends Record<string, unknown>> =
  | boolean
  | TooltipOptions<TRow>;

/**
 * Resolved tooltip config handed from a chart kind down to a plot. Presence of
 * this object on a plot is what turns hovering on.
 */
export type TooltipRuntime<TRow extends Record<string, unknown>> = {
  format: (row: TRow) => string;
  /** Identifies the originating facet (`''` when not faceted). */
  facetId: string;
  sync: TooltipSync;
};

/** Normalize the author-facing prop into `{ enabled, sync, format? }`. */
export function resolveTooltip<TRow extends Record<string, unknown>>(
  tooltip: TooltipProp<TRow> | undefined,
  defaultSync: TooltipSync,
): { enabled: boolean; sync: TooltipSync; format?: (row: TRow) => string } {
  if (!tooltip) return { enabled: false, sync: defaultSync };
  if (tooltip === true) return { enabled: true, sync: defaultSync };
  return { enabled: true, sync: tooltip.sync ?? defaultSync, format: tooltip.format };
}
