import type { AxisValue } from '$lib/types/layout/scales';
import type { StrokeStyle, FontStyle, DotStyle } from '$lib/types/plots/styling';
import type { AxisBasedMarkersConfig } from './common';

/** Which endpoint a delta measures from/to: a named series, or a fixed axis value (defaults to `0`). */
export type DeltaTarget =
  | { type: 'series'; series: string }
  | { type: 'axis'; value?: number };

/** How far apart two points are on a line chart: a given x (or y), or a series' distance from a fixed axis value. */
export type DeltaConfig = {
  axis: 'x' | 'y';
  at: AxisValue;
  from: DeltaTarget;
  to?: DeltaTarget;
  formatDiff?: (diff: number) => string;
  strokeStyle?: StrokeStyle;
  fontStyle?: FontStyle;
  dotStyle?: DotStyle;
};

/**
 * A delta annotation between two points on a line chart, resolved against
 * series data (`utils/delta.ts`). `xDomain`/`yDomain` optionally clamp
 * the varying endpoint to the plot's own axis range.
 */
export type DeltaMarkerConfig = {
  type: 'delta';
  xDomain?: (number | string | Date)[];
  yDomain?: (number | string | Date)[];
} & DeltaConfig;

/** `LinePlot`'s own `markers` prop type — every {@link AxisBasedMarkersConfig} kind plus the line-only `'delta'` annotation. */
export type LineMarkersConfig = AxisBasedMarkersConfig | DeltaMarkerConfig;
