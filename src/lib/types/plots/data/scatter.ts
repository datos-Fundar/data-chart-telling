import type { Accessor, SeriesProps, DataProps } from '$lib/types/plots/data/common';

/**
 * `SeriesProps`/`DataProps`, plus an optional per-row bubble radius —
 * ScatterPlot's own data contract. A field key or accessor function is
 * bound to svelteplot's own auto sqrt scale (mirroring how `x`/`y` are
 * bound to their own scales), so bubble *area* — not radius — ends up
 * proportional to the raw values with no manual scaling needed; feeding it
 * an already-scaled value double-scales it. A literal number bypasses
 * scaling entirely (a fixed pixel radius, same as the default dot size).
 */
export type ScatterDataProps<T extends Record<string, unknown>> = (SeriesProps<T> | DataProps<T>) & {
  r?: Accessor<T, number> | number;
  /** Categorical shape-value accessor — configure the mapping via `scales.symbol`. ScatterPlot's own dots are the only default mark with a shape concept. */
  symbol?: Accessor<T, unknown>;
};
