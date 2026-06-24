import type { AxisValue } from '$lib/types/plots/common';
import type { DotStyle, FontStyle, StrokeStyle } from '$lib/types/plots/styles';
import type { TooltipSync } from '$lib/types/layout/tooltip';

/**
 * Baseline props every marker component receives when mounted by a plot:
 * `data` for the points/values it draws, plus `series`/`seriesColor` when
 * mounted per-series via a `CustomComponentMarker`. Marker components extend
 * this with whatever else they need (e.g. PeakMarker's `mode`, `label`).
 */
export interface MarkerProps<TData = Record<string, unknown>> {
  data?: TData[];
  series?: string;
  seriesColor?: string;
}

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
 * one series, optionally further split by `strategy: 'segment'`, follows the
 * same targeting fields as {@link CustomComponentMarker}.
 */
export type HoverMarkerConfig = {
  type: 'hover';
  series?: string;
  strategy?: 'series' | 'segment';
  ruleX?: boolean;
  ruleY?: boolean;
  color?: string;
  showLabels?: boolean;
  ruleStyle?: StrokeStyle;
  dotStyle?: DotStyle;
  fontStyle?: FontStyle;
  sync?: TooltipSync;
};

export type CustomComponentMarker = {
  type: 'component';
  series?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any;
  props?: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any[];
  strategy?: 'series' | 'segment';
};

export type Marker = RuleXMarker | RuleYMarker | HoverMarkerConfig | CustomComponentMarker;
