import type { XValue, YValue } from '$lib/types/plots/common';

export type LineSegmentStyle = {
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  strokeDasharray?: string;
};

export type LineRangeSegment = {
  from?: XValue;
  to?: XValue;
  style?: LineSegmentStyle;
};

export type VisualSegment<T extends Record<string, unknown>> = {
  data: T[];
  style: LineSegmentStyle;
};

export type VisualGroup<T extends Record<string, unknown>> = {
  series: LineSeries<T>;
  visualSegments: VisualSegment<T>[];
};

export type SegmentsMap = Record<string, LineRangeSegment[]>;

export type LineSeries<T extends Record<string, unknown> = Record<string, unknown>> = {
  name: string;
  x: keyof T | ((d: T) => XValue);
  y: keyof T | ((d: T) => YValue);
  data: T[];
};
