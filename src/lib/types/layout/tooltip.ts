import type { Snippet } from 'svelte';
import type { XValue } from '$lib/types/plots/common';

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
  /** Named subset of crossing series to include (sync `x`/`y`/`xy`). Omitted = all matched. */
  series?: string[];
  /** Custom tooltip body; when given, replaces `format` entirely. Receives the
   *  matched, series-filtered rows (length >= 1 whenever the tooltip is shown). */
  content?: Snippet<[{ rows: TRow[] }]>;
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
  series?: string[];
  content?: Snippet<[{ rows: TRow[] }]>;
};

/**
 * Shared hover state for cross-facet tooltip syncing.
 *
 * {@link Chart} provides one store via context; every faceted plot reads the
 * same instance, so a hover detected in one facet (which writes `activeX/Y` and
 * stamps itself as `source`) is visible to the others. A standalone plot with no
 * provider falls back to its own {@link createHover} store.
 */
export type HoverStore = {
  activeX: XValue | null;
  activeY: XValue | null;
  /** Series of the hovered row, when the plot kind has a series concept (line/bar). */
  activeSeries: string | null;
  /**
   * Mouse position within the source facet's own box, as a fraction of its
   * width/height (each in `[0, 1]`). Other facets reproject this onto their
   * own box so a broadcast tooltip lands at the same *relative* spot the
   * cursor is actually at, rather than a fixed corner.
   */
  cursorFrac: { x: number; y: number } | null;
  /** Facet id that currently owns the hover (`''` when not faceted). */
  source: string | null;
  sync: TooltipSync;
};

/** A point ready to render: its plotted position plus its label. */
export type HoverDisplayPoint = {
  x: XValue;
  y: XValue | number;
  label: string;
  /** Owning series name; undefined for plot kinds with no series concept (heatmap). */
  series?: string;
};

/** A candidate point for hover matching/highlighting — also carries its source row. */
export type HoverPoint<T> = HoverDisplayPoint & {
  row: T;
};
