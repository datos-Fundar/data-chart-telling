import type { SymbolType, LineStyle } from '$lib/types/plots/styles';

export type LegendSectionType = 'discrete' | 'continuous';

export type LegendItem = {
  /** Stable id; also matches a series/group name for opacity toggling. */
  name: string;
  label?: string;
  color?: string;
  symbol?: SymbolType;
  opacity?: number;
  lineStyle?: LineStyle;
};

export type DiscreteLegendSection = {
  type: 'discrete';
  title?: string;
  items: LegendItem[];
  /** Number of columns the items flow into. */
  columns?: number;
};

export type ContinuousLegendSection = {
  type: 'continuous';
  title?: string;
  columns?: number;
  min: number;
  max: number;
  /** Gradient endpoints; default to the configured continuous palette. */
  colorMin?: string;
  colorMax?: string;
  ticks?: number[];
  width?: number;
  format?: (v: number) => string;
};

export type LegendSection = DiscreteLegendSection | ContinuousLegendSection;
