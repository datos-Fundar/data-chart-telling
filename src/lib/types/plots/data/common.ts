import type { AxisValue } from '$lib/types/layout/scales';

/**
 * A field key or accessor function. Mirrors the shorthand used across plots
 * so chart-level encodings (`x`, `y`, `z`, facet, timeline) feel consistent
 * with the plot-level series definitions.
 */
export type Accessor<TRow extends Record<string, unknown>, V> =
  | keyof TRow
  | ((d: TRow) => V);

/**
 * A plot series: a name, x/y accessors and the rows it draws. Shared as-is by
 * every mark (line, bar, …) — none of them need anything beyond this shape;
 * visual styling lives separately in `segments`.
 */
export type Series<T extends Record<string, unknown> = Record<string, unknown>> = {
  name: string;
  x: Accessor<T, AxisValue>;
  y: Accessor<T, AxisValue>;
  z?: Accessor<T, unknown>;
  data: T[];
};

/**
 * Pre-built series. Mutually exclusive with {@link DataProps} — takes
 * precedence when both could apply.
 */
export type SeriesProps<T extends Record<string, unknown>> = {
  series: Series<T>[];
  data?: never;
  x?: never;
  y?: never;
  z?: never;
};

/**
 * Flat rows to group into series, as an alternative to {@link SeriesProps}.
 */
export type DataProps<T extends Record<string, unknown>> = {
  series?: never;
  data: T[];
  x: Accessor<T, AxisValue>;
  y: Accessor<T, AxisValue>;
  z?: Accessor<T, unknown>;
};
