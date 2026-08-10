import type { AxisValue } from '$lib/types/plots/axis';
import type { DotStyle, FontStyle, StrokeStyle, BarStyle } from '$lib/types/plots/styling';
import type { HoverStrategy, HoverDisplayPoint } from '$lib/types/layout/tooltip';

export type RuleMarkerConfig = {
  type: 'rule';
  axis: 'x' | 'y';
  value: AxisValue;
  style?: StrokeStyle;
};

/**
 * The in-SVG hover highlight (crosshair + dot + label), opt-in via `markers`
 * so it can be combined freely with — or used entirely without — the HTML
 * tooltip. Omitting `series` mounts it unscoped (all series); scoping it to
 * one series follows the same targeting fields as {@link CustomComponentMarkerConfig}.
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
 * A single rectangular bar mark, emitted by `BarPlot` itself (via
 * `buildBarMarkers`) rather than authored directly — `GeometryLayout` renders
 * whatever `'bar'` markers it's given, the same way it renders any other
 * marker kind.
 *
 * `role: 'segment'` is a visible bar/segment: `x`/`y`/`x1`/`x2`/`y1`/`y2`
 * are channel accessors fed straight into svelteplot's `<BarX>`/`<BarY>`
 * (matching whichever pair `isHorizontal` implies), alongside `data` (the
 * rows this call renders) and `style`.
 *
 * `role: 'hitArea'` is an invisible, full-value-axis-extent hit region for
 * one category — `category` and `data` (every row across every series at
 * that category) are used to resolve its pixel geometry against the live
 * scale at render time; `onpointerenter`/`onpointerleave` drive the hover
 * match directly (see `HoverStore`/`setHoverMatch`).
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

export type Marker =
  | RuleMarkerConfig
  | HoverMarkerConfig
  | CustomComponentMarkerConfig
  | BarMarkerConfig;
