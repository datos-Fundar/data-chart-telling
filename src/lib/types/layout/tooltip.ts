import type { Snippet } from 'svelte';
import type { AxisValue } from '$lib/types/layout/scales';

/**
 * How the hover highlight finds related points within a facet.
 * - `'x'` all points sharing the hovered x (default for line / bar).
 * - `'y'` all points sharing the hovered y (default for pyramid).
 * - `'punctual'` exact XY match — one cell at a time (default for heatmap).
 */
export type HoverStrategy = 'x' | 'y' | 'punctual';

/**
 * Preferred horizontal placement of the floating tooltip relative to the
 * cursor: `'right'`/`'left'` offset it clear of the cursor (so it never
 * covers the hovered point); `'middle'` centers it on the cursor's x, same
 * as the plot's own vertical `'middle'`. Falls back toward the opposite
 * side (via `'middle'`) when the preferred side would overflow the plot's
 * bounds — see {@link resolveTooltipPlacement}. System default: `'right'`.
 */
export type TooltipAnchorX = 'left' | 'middle' | 'right';

/**
 * Preferred vertical placement of the floating tooltip relative to the
 * cursor — same fallback behavior as {@link TooltipAnchorX}, along the other
 * axis. System default: `'bottom'`.
 */
export type TooltipAnchorY = 'top' | 'middle' | 'bottom';

/** Author-facing tooltip option on the chart kinds. `true` = enable with defaults. */
export type TooltipOptions<TRow extends Record<string, unknown>> = {
  /** Matching strategy. Defaults to the chart kind's own default. */
  strategy?: HoverStrategy;
  /**
   * Broadcast the hover to other facets. When `true` every facet with a
   * matching point highlights it using the same strategy. Defaults to `false`.
   */
  sync?: boolean;
  /** Custom tooltip text for a row (supports `\n`). Defaults per chart kind. */
  format?: (row: TRow) => string;
  /** Named subset of crossing series to include. Omitted = all matched. */
  series?: string[];
  /** Custom tooltip body; replaces `format` when given. */
  content?: Snippet<[{ rows: TRow[] }]>;
  /** Preferred horizontal anchor — see {@link TooltipAnchorX}. */
  anchorX?: TooltipAnchorX;
  /** Preferred vertical anchor — see {@link TooltipAnchorY}. */
  anchorY?: TooltipAnchorY;
};

/** Either a bare on/off flag or the full option object. */
export type TooltipProp<TRow extends Record<string, unknown>> =
  | boolean
  | TooltipOptions<TRow>;

/**
 * Shared hover state for cross-facet tooltip syncing.
 *
 * {@link BaseChart} provides one store via context; every faceted plot reads the
 * same instance, so a hover detected in one facet (which writes `activeX/Y` and
 * stamps itself as `source`) is visible to the others. A standalone plot with no
 * provider falls back to its own {@link createHover} store.
 */
export type HoverStore = {
  activeX: AxisValue | null;
  activeY: AxisValue | null;
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
  /** How related points are found within a facet. */
  strategy: HoverStrategy;
  /** Whether the hover is broadcast to other facets. */
  sync: boolean;
};

/** A point ready to render: its plotted position plus its label. */
export type HoverDisplayPoint = {
  x: AxisValue;
  y: AxisValue;
  label: string;
  /** Owning series name; undefined for plot kinds with no series concept (heatmap). */
  series?: string;
  /** Resolved series color — used by HoverMarker when dotFill/fill is `'currentColor'`. */
  color?: string;
  /**
   * Pixel nudge applied on top of the scaled `x`/`y` position — for plot kinds
   * where a series' visual position isn't fully captured by its data value
   * (e.g. BarPlot's 'grouped' layout, where every series shares the same `x`
   * category but is drawn at its own pixel slice within that category's band).
   * Matching (`matchByStrategy`) still compares raw `x`/`y`, so this is
   * display-only and never affects which points highlight together.
   */
  dx?: number;
  dy?: number;
};

/** A candidate point for hover matching/highlighting — also carries its source row. */
export type HoverPoint<T> = HoverDisplayPoint & {
  row: T;
};
