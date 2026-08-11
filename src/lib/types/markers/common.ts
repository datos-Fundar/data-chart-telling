import type { AxisValue } from '$lib/types/layout/scales';
import type { DotStyle, FontStyle, StrokeStyle, BarStyle } from '$lib/types/plots/styling';
import type { HoverStrategy, HoverDisplayPoint } from '$lib/types/layout/tooltip';

export type RuleMarkerConfig = {
  type: 'rule';
  axis: 'x' | 'y';
  value: AxisValue;
  style?: StrokeStyle;
};

/**
 * In-SVG hover highlight (crosshair + dot + label). Omitting `series`
 * applies it to all series; scoping follows the same fields as
 * {@link CustomComponentMarkerConfig}.
 */
export type HoverMarkerConfig = {
  type: 'hover';
  series?: string;
  scope?: 'series' | 'segment';
  strategy?: HoverStrategy;
  sync?: boolean;
  ruleX?: boolean;
  ruleY?: boolean;
  showLabels?: boolean;
  format?: (point: HoverDisplayPoint) => string;
  ruleStyle?: StrokeStyle;
  dotStyle?: DotStyle;
  fontStyle?: FontStyle;
};

export type CustomComponentMarkerConfig = {
  type: 'component';
  series?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any;
  props?: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any[];
  scope?: 'series' | 'segment';
};

/**
 * A single bar mark, built by `BarPlot` (via `buildBarMarkers`) rather than
 * authored directly.
 *
 * `role: 'segment'` is a visible bar: `x`/`y`/`x1`/`x2`/`y1`/`y2` map to
 * svelteplot's `<BarX>`/`<BarY>` per `isHorizontal`. `role: 'hitArea'` is an
 * invisible per-category hit region for hover, resolved against the live
 * scale at render time.
 */
export type BarMarkerConfig = {
  type: 'bar';
  role: 'segment' | 'hitArea';
  isHorizontal: boolean;
  data: Record<string, unknown>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  x?: (d: any) => AxisValue;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y?: (d: any) => AxisValue;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  x1?: number | ((d: any) => number);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  x2?: number | ((d: any) => number);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y1?: number | ((d: any) => number);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y2?: number | ((d: any) => number);
  insetTop?: number;
  insetBottom?: number;
  insetLeft?: number;
  insetRight?: number;
  style?: BarStyle;
  category?: AxisValue;
  onpointerenter?: () => void;
  onpointerleave?: () => void;
};

/**
 * A single line-segment stroke, built by `LinePlot` (via `buildLineMarkers`).
 * Endpoint dots are a separate `'dot'` marker rather than a field here.
 */
export type LineMarkerConfig = {
  type: 'line';
  data: Record<string, unknown>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  x: (d: any) => AxisValue;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y: (d: any) => AxisValue;
  style?: StrokeStyle;
};

/** A set of point marks (svelteplot's `Dot`) — a line's endpoint dots, or authored directly. */
export type DotMarkerConfig = {
  type: 'dot';
  data: Record<string, unknown>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  x: (d: any) => AxisValue;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y: (d: any) => AxisValue;
  style?: DotStyle;
};

/**
 * A single heatmap cell mark, built by `HeatmapPlot` (via `buildCellMarkers`).
 * `fill` stays a per-row accessor; the rest of the style is constant per call.
 */
export type CellMarkerConfig = {
  type: 'cell';
  data: Record<string, unknown>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  x: (d: any) => AxisValue;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y: (d: any) => AxisValue;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fill: (d: any) => string;
  style?: { fillOpacity?: number; stroke?: string; strokeWidth?: number };
  inset?: number;
};

export type Marker =
  | RuleMarkerConfig
  | HoverMarkerConfig
  | CustomComponentMarkerConfig
  | BarMarkerConfig
  | LineMarkerConfig
  | DotMarkerConfig
  | CellMarkerConfig;
