import type { XValue, YValue } from '$lib/types/plots/common';

export type BarSeries<T extends Record<string, unknown> = Record<string, unknown>> = {
  name: string;
  x: keyof T | ((d: T) => XValue);
  y: keyof T | ((d: T) => YValue);
  data: T[];
  fill: string;
  fillOpacity?: number;
};
