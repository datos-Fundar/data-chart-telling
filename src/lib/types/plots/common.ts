export type XValue = number | string | Date;
export type YValue = number;

/**
 * Author-facing scale overrides for a plot axis. Shared by every plot kind —
 * `domain`/`reverse` reorder or restrict the axis, `nice` rounds it, and
 * `label` is read by svelteplot's `<Plot>` to title the axis, so a plot kind
 * never needs a separate `xLabel`/`yLabel` prop.
 */
export type AxisScale = {
  domain?: (number | string | Date)[];
  nice?: boolean;
  reverse?: boolean;
  label?: string;
};

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
  x: Accessor<T, XValue>;
  y: Accessor<T, YValue>;
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
  x: Accessor<T, XValue>;
  y: Accessor<T, YValue>;
  /** Grouping dimension: one series per distinct value. */
  z?: Accessor<T, unknown>;
};
