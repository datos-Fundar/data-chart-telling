import type { XValue, YValue } from '$lib/types/plots/common';
import type { StrokeStyle } from '$lib/types/plots/styles';

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
  x: XValue;
  style?: StrokeStyle;
};

export type RuleYMarker = {
  type: 'ruleY';
  y: YValue;
  style?: StrokeStyle;
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

export type Marker = RuleXMarker | RuleYMarker | CustomComponentMarker;
