import type { XValue, Accessor } from '$lib/types/plots/common';

/**
 * A heatmap is a single grid of cells. `x`/`y` are categorical (band) keys and
 * `value` drives the cell colour through a caller-supplied scale.
 */
export type HeatmapSeries<T extends Record<string, unknown> = Record<string, unknown>> = {
  data: T[];
  x: Accessor<T, XValue>;
  y: Accessor<T, XValue>;
  value: Accessor<T, number>;
};
