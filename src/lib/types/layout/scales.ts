export type AxisValue = number | string | Date;

/**
 * Author-facing scale overrides for a plot axis. Mirrors svelteplot's
 * `ScaleOptions` + `XScaleOptions` in full — `type`, `padding`, `domain`,
 * `nice`, `reverse`, `label`, `tickFormat`, `labelAnchor`, etc.
 *
 * Used for both `x` and `y` entries in `ScalesConfig`. X-specific
 * fields (`labelAnchor`, `tickRotate`) are accepted on `y` too; svelteplot
 * silently ignores any inapplicable options.
 *
 * `TData` is the plot's own row type — it's what {@link AxisScale.sort}
 * receives, so ordering isn't limited to comparing this axis's own value.
 */
export type AxisScale<TData = Record<string, unknown>> = {
  type?: 'auto' | 'linear' | 'pow' | 'sqrt' | 'log' | 'symlog' | 'time' | 'utc' | 'point' | 'ordinal' | 'sequential' | 'band' | 'categorical' | 'cyclical' | 'threshold' | 'quantile-cont' | 'quantile' | 'quantize' | 'diverging' | 'diverging-log' | 'diverging-pow' | 'diverging-sqrt' | 'diverging-symlog';
  domain?: (number | string | boolean | Date | null)[];
  range?: (number | string | boolean | Date | null)[];
  reverse?: boolean;
  label?: string | false;
  labelAnchor?: 'auto' | 'left' | 'center' | 'right' | 'bottom' | 'middle' | 'top';
  labelOrientation?: 'horizontal' | 'vertical';
  labelPosition?: 'top' | 'middle';
  titleFontSize?: number;
  interval?: string | number;
  clamp?: boolean;
  nice?: boolean;
  zero?: boolean;
  round?: boolean;
  percent?: boolean;
  align?: number;
  base?: number;
  constant?: number;
  sort?: (a: TData, b: TData) => number;
  grid?: boolean | { stroke?: string; strokeWidth?: number; strokeOpacity?: number; strokeDasharray?: string };
  padding?: number;
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
  tickRotate?: number;
  tickFormat?: false | Intl.NumberFormatOptions | Intl.DateTimeFormatOptions | ((d: unknown, index: number, ticks: unknown[]) => string | string[]);
  seriesLayout?: 'overlap' | 'grouped' | 'stacked';
  seriesPadding?: number;
};

/**
 * Per-axis scale overrides, passed as a single `scales` prop to every
 * axis-based plot kind (`GeoPlot` uses `GeoScalesConfig` instead — a map has
 * no x/y/z axis pair). `TData` threads through to {@link AxisScale.sort} on
 * each axis.
 */
export type AxisBasedScalesConfig<TData = Record<string, unknown>> = {
  x?: AxisScale<TData>;
  y?: AxisScale<TData>;
  z?: AxisScale<TData>;
};
