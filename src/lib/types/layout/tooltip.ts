import type { Snippet } from 'svelte';
import type { AxisValue } from '$lib/types/layout/mapping';

/**
 * How the hover highlight finds related points within a facet.
 * - `'x'` all points sharing the hovered x (default for line / bar).
 * - `'y'` all points sharing the hovered y (default for pyramid).
 * - `'punctual'` exact XY match - one cell at a time (default for heatmap).
 * - `'series'` all points sharing the hovered series, regardless of x/y.
 */
export type HoverStrategy = 'x' | 'y' | 'punctual' | 'series';

/**
 * Preferred horizontal placement of the tooltip beside the cursor; it moves
 * to the other side when it would overflow. Defaults to `'right'`.
 */
export type TooltipAnchorX = 'left' | 'middle' | 'right';

/** Preferred vertical placement of the tooltip, like {@link TooltipAnchorX}. Defaults to `'bottom'`. */
export type TooltipAnchorY = 'top' | 'middle' | 'bottom';

/** Author-facing tooltip option on the chart kinds. `true` = enable with defaults. */
export type TooltipOptions<TRow extends Record<string, unknown>> = {
  /** Matching strategy. Defaults to the chart kind's own default. */
  strategy?: HoverStrategy;
  /** Highlight the hovered point in every synced plot too. Defaults to `false`. */
  sync?: boolean;
  /** Custom tooltip text for a row (supports `\n`). Defaults per chart kind. */
  format?: (row: TRow) => string;
  /** Named subset of crossing series to include. Omitted = all matched. */
  series?: string[];
  /** Custom tooltip body; replaces `format` when given. */
  content?: Snippet<[{ rows: TRow[] }]>;
  /** Preferred horizontal anchor - see {@link TooltipAnchorX}. */
  anchorX?: TooltipAnchorX;
  /** Preferred vertical anchor - see {@link TooltipAnchorY}. */
  anchorY?: TooltipAnchorY;
};

/** Either a bare on/off flag or the full option object. */
export type TooltipProp<TRow extends Record<string, unknown>> =
  | boolean
  | TooltipOptions<TRow>;

/** Hover state shared by every plot under one provider (a shell or a composer). */
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

/** A point ready to render: its plotted position plus its label. */
export type HoverDisplayPoint = {
  x: AxisValue;
  y: AxisValue;
  label: string;
  /** Owning series name; undefined for plot kinds with no series concept (heatmap). */
  series?: string;
  /** Resolved series color - used by HoverMarker when dotFill/fill is `'currentColor'`. */
  color?: string;
  /** Pixel offset on the drawn position only, e.g. a grouped bar's slice of its band. */
  dx?: number;
  dy?: number;
  /** A 'grouped' series' own slice of the category band, as start/end fractions (0-1) of the whole band. `undefined` means the whole band. */
  areaInset?: { start: number; end: number };
};

/** A candidate point for hover matching/highlighting - also carries its source row. */
export type HoverPoint<T> = HoverDisplayPoint & {
  row: T;
};
