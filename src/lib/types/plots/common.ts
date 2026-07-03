export type AxisValue = number | string | Date;

/**
 * Partial margin override — only the sides you specify are overridden; the
 * rest come from the theme (which itself defaults every side to `'auto'`).
 * `'auto'` sizes that side to fit its rendered content (tick labels, axis
 * title, rotated ticks); a number pins it exactly.
 */
export type MarginConfig = Partial<{ top: number | 'auto'; right: number | 'auto'; bottom: number | 'auto'; left: number | 'auto' }>;

/**
 * Author-facing scale overrides for a plot axis. Mirrors svelteplot's
 * `ScaleOptions` + `XScaleOptions` in full — `type`, `padding`, `domain`,
 * `nice`, `reverse`, `label`, `tickFormat`, `labelAnchor`, etc.
 *
 * Used for both `x` and `y` entries in {@link ScalesConfig}. X-specific
 * fields (`labelAnchor`, `tickRotate`) are accepted on `y` too; svelteplot
 * silently ignores any inapplicable options.
 */
export type AxisScale = {
  type?: 'auto' | 'linear' | 'pow' | 'sqrt' | 'log' | 'symlog' | 'time' | 'utc' | 'point' | 'ordinal' | 'sequential' | 'band' | 'categorical' | 'cyclical' | 'threshold' | 'quantile-cont' | 'quantile' | 'quantize' | 'diverging' | 'diverging-log' | 'diverging-pow' | 'diverging-sqrt' | 'diverging-symlog';
  domain?: (number | string | boolean | Date | null)[];
  range?: (number | string | boolean | Date | null)[];
  reverse?: boolean;
  label?: string | false;
  labelAnchor?: 'auto' | 'left' | 'center' | 'right' | 'bottom' | 'middle' | 'top';
  interval?: string | number;
  clamp?: boolean;
  nice?: boolean;
  zero?: boolean;
  round?: boolean;
  percent?: boolean;
  padding?: number;
  align?: number;
  paddingInner?: number;
  paddingOuter?: number;
  insetLeft?: number;
  insetRight?: number;
  insetTop?: number;
  insetBottom?: number;
  ticks?: (number | string | boolean | Date | null)[];
  tickSpacing?: number;
  tickSize?: number;
  tickPadding?: number;
  titleFontSize?: number;
  base?: number;
  constant?: number;
  sort?: (a: AxisValue, b: AxisValue) => number;
  grid?: boolean | { stroke?: string; strokeWidth?: number; strokeOpacity?: number; strokeDasharray?: string };
  tickRotate?: number;
  tickFormat?: false | Intl.NumberFormatOptions | Intl.DateTimeFormatOptions | ((d: unknown, index: number, ticks: unknown[]) => string | string[]);
  labelOrientation?: 'horizontal' | 'vertical';
  labelPosition?: 'top' | 'middle';
};

/**
 * Per-axis scale overrides, passed as a single `scales` prop to every plot
 * kind.
 */
export type ScalesConfig = {
  x?: AxisScale;
  y?: AxisScale;
  z?: AxisScale;
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
