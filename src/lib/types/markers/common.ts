import type { AxisValue } from '$lib/types/layout/scales';
import type { FontStyle, StrokeStyle, DotStyle, AreaStyle } from '$lib/types/plots/styling';
import type { HoverStrategy, HoverDisplayPoint } from '$lib/types/layout/tooltip';
import type { BaseMarkersConfig } from './base';

export type { DotMarkerConfig } from './base';

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
  /**
   * Thickened area in place of a thin crosshair — sized to the hovered
   * bar/cell's own width, spanning the full opposite axis. Off by default;
   * meaningful only on a band (categorical) scale, so it renders nothing on
   * a line/scatter plot's continuous axis.
   */
  areaX?: boolean;
  areaY?: boolean;
  showLabels?: boolean;
  format?: (point: HoverDisplayPoint) => string;
  ruleStyle?: StrokeStyle;
  areaStyle?: AreaStyle;
  dotStyle?: DotStyle;
  fontStyle?: FontStyle;
};

/** A single line-segment stroke. Endpoint dots are a separate `'dot'` marker rather than a field here. */
export type LineMarkerConfig = {
  type: 'line';
  data: Record<string, unknown>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  x: (d: any) => AxisValue;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y: (d: any) => AxisValue;
  style?: StrokeStyle;
};

/**
 * A single bar mark. `role: 'segment'` is a visible bar
 * (`x`/`y`/`x1`/`x2`/`y1`/`y2` map to svelteplot's `<BarX>`/`<BarY>` per
 * `isHorizontal`); `role: 'hitArea'` is an invisible per-category hit region
 * for hover, resolved against the live scale at render time; `role:
 * 'highlight'` is `HoverMarkerConfig`'s `areaX`/`areaY` highlight — a
 * visible, non-interactive rect centered on `category`, spanning the full
 * opposite axis, sized to the category band's own width plus 2px.
 */
export type BarMarkerConfig = {
  type: 'bar';
  role: 'segment' | 'hitArea' | 'highlight';
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
  style?: AreaStyle;
  category?: AxisValue;
  onpointerenter?: () => void;
  onpointerleave?: () => void;
};

/** A single heatmap cell mark. `fill` stays a per-row accessor; the rest of the style is constant per call. */
export type CellMarkerConfig = {
  type: 'cell';
  data: Record<string, unknown>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  x: (d: any) => AxisValue;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y: (d: any) => AxisValue;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fill: (d: any) => string;
  style?: AreaStyle;
  inset?: number;
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
 * Every marker kind any axis-based plot can render: {@link BaseMarkersConfig}
 * plus every axis-based-only kind. `BarPlot`/`HeatmapPlot`/`PyramidPlot` use
 * this directly as their `markers` prop type; `LinePlot`'s own
 * `LineMarkersConfig` (`types/markers/line.ts`) unions it with the line-only
 * `delta` annotation instead.
 */
export type AxisBasedMarkersConfig =
  | BaseMarkersConfig
  | RuleMarkerConfig
  | HoverMarkerConfig
  | LineMarkerConfig
  | BarMarkerConfig
  | CellMarkerConfig
  | CustomComponentMarkerConfig;
