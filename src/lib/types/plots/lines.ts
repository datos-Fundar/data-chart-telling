import type { XValue, YValue } from '$lib/types/plots/common';
import type { LineStrokeStyle, LineDotStyle } from '$lib/types/plots/styles';

export type LineSegmentStyle = {
  stroke?: LineStrokeStyle;
  dots?: LineDotStyle;
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

export type LineSegment = LineSegmentStyle;

export type LineSeries<T extends Record<string, unknown> = Record<string, unknown>> = {
  name: string;
  x: keyof T | ((d: T) => XValue);
  y: keyof T | ((d: T) => YValue);
  data: T[];
};

export type DeltaTarget =
  | { type: 'series'; series: string }
  | { type: 'axis'; value?: number };

export type DeltaConfig = {
  at: XValue | YValue;
  from: DeltaTarget;
  to?: DeltaTarget;
  stroke?: LineStrokeStyle;
  formatDiff?: (diff: number) => string;
  dx?: number;
  dy?: number;
  lineAnchor?: 'bottom' | 'middle' | 'top';
};
