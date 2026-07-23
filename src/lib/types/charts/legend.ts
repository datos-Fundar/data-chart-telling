import type { SymbolType, LineStyle } from '$lib/types/plots/constants';
import type { StrokeStyle, DotStyle } from '$lib/types/plots/styling';

export type LegendSectionType = 'discrete' | 'continuous';

/**
 * Style applied to whatever a legend interaction has turned "off" — a
 * toggled-off discrete series, or a datapoint/cell/feature outside an active
 * continuous range filter. `opacity` is a blanket convenience: any
 * `*Opacity` field a consumer doesn't set falls back to it, so
 * `{ opacity: 0.1 }` alone is enough to read as "disabled" everywhere.
 */
export type LegendDisabledStyle = {
  opacity?: number;
  stroke?: StrokeStyle;
  dots?: DotStyle;
  fill?: string;
  fillOpacity?: number;
};

export type LegendItem = {
  name: string;
  label?: string;
  color?: string;
  symbol?: SymbolType;
  opacity?: number;
  lineStyle?: LineStyle;
  /** Initial toggled-off state (uncontrolled — the user can still click it back on). */
  disabled?: boolean;
};

export type DiscreteLegendSection = {
  type: 'discrete';
  title?: string;
  items: LegendItem[];
  columns?: number;
  /** Enables click-to-toggle on each item. */
  interactive?: boolean;
  /** Style applied to a toggled-off item's series. Falls back to `cfg.legend.disabledOpacity`. */
  disabledStyle?: LegendDisabledStyle;
};

export type ContinuousLegendSection = {
  type: 'continuous';
  title?: string;
  columns?: number;
  min: number;
  max: number;
  colorMin?: string;
  colorMax?: string;
  ticks?: number[];
  width?: number;
  format?: (v: number) => string;
  /** Enables drag handles on the bar's edges to narrow the visible range. */
  interactive?: boolean;
  /**
   * How the color ramp responds to a narrowed range: `'rescale'` reprojects
   * it onto the new bounds, `'filter'` keeps the original domain and only
   * excludes out-of-range values. Defaults to `'filter'`.
   */
  mode?: 'rescale' | 'filter';
  /** Style applied to values outside the active range. Falls back to `cfg.legend.disabledOpacity`. */
  disabledStyle?: LegendDisabledStyle;
};

export type LegendSection = DiscreteLegendSection | ContinuousLegendSection;
