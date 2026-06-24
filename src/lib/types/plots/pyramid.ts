import type { Accessor, Series, XValue, YValue } from '$lib/types/plots/common';

/** Which half of the diverging axis a series is mirrored onto. */
export type PyramidSide = 'left' | 'right';

/**
 * One side's series for a population-pyramid-style diverging chart (e.g. one
 * sex). Reuses {@link Series} as-is so the existing segment/grouping
 * utilities (built for line/bar) work unchanged — `x` is the shared category
 * band (e.g. age group), `y` the magnitude, always given positive; the plot
 * mirrors it left or right based on `side`. Note `x`/`y` here don't track the
 * rendered axes (the category ends up on the plot's y-axis, the magnitude on
 * its x-axis) — they track the same "category / metric" roles {@link Series}
 * carries for every other mark.
 */
export type PyramidSeries<T extends Record<string, unknown> = Record<string, unknown>> =
  Series<T> & { side: PyramidSide };

/**
 * Pre-built series. Mutually exclusive with {@link PyramidDataProps} — takes
 * precedence when both could apply.
 */
export type PyramidSeriesProps<T extends Record<string, unknown>> = {
  series: PyramidSeries<T>[];
  data?: never;
  y?: never;
  x?: never;
  side?: never;
  z?: never;
};

/**
 * Flat rows to group into series, as an alternative to {@link
 * PyramidSeriesProps} — mirrors how `LinePlot`/`BarPlot` accept `data` +
 * accessors instead of pre-built series.
 */
export type PyramidDataProps<T extends Record<string, unknown>> = {
  series?: never;
  data: T[];
  /** Category bands, e.g. age group — rendered on the Y axis. */
  y: Accessor<T, XValue>;
  /** Magnitude, always given positive — mirrored left or right by `side`. */
  x: Accessor<T, YValue>;
  /** Maps each `z` group value to the half it is drawn on. */
  side: Record<string, PyramidSide>;
  /** Groups rows into one series per value, e.g. by sex. */
  z: Accessor<T, unknown>;
};
