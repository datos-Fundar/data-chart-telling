import type { XValue, YValue } from '$lib/types/plots/common';

export type MarkerStyle = {
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  strokeDasharray?: string;
};

export type RuleXMarker = {
  type: 'ruleX';
  x: XValue;
  style?: MarkerStyle;
};

export type RuleYMarker = {
  type: 'ruleY';
  y: YValue;
  style?: MarkerStyle;
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
