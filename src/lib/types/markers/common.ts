import type { AxisValue } from '$lib/types/plots/axis';
import type { DotStyle, FontStyle, StrokeStyle } from '$lib/types/plots/styling';
import type { HoverStrategy, HoverDisplayPoint } from '$lib/types/layout/tooltip';

export type RuleXMarker = {
  type: 'ruleX';
  x: AxisValue;
  style?: StrokeStyle;
};

export type RuleYMarker = {
  type: 'ruleY';
  y: AxisValue;
  style?: StrokeStyle;
};

/**
 * The in-SVG hover highlight (crosshair + dot + label), opt-in via `markers`
 * so it can be combined freely with — or used entirely without — the HTML
 * tooltip. Omitting `series` mounts it unscoped (all series); scoping it to
 * one series follows the same targeting fields as {@link CustomComponentMarker}.
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

export type CustomComponentMarker = {
  type: 'component';
  series?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any;
  props?: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any[];
  scope?: 'series' | 'segment';
};

export type Marker = 
  | RuleXMarker
  | RuleYMarker
  | HoverMarkerConfig
  | CustomComponentMarker;
