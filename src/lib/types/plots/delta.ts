import type { AxisValue } from '$lib/types/plots/common';
import type { StrokeStyle, FontStyle, DotStyle } from '$lib/types/plots/styles';

export type DeltaTarget =
  | { type: 'series'; series: string }
  | { type: 'axis'; value?: number };

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
