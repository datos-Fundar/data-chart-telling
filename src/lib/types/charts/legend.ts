import type { SymbolType, LineStyle } from '$lib/types/plots/constants';

export type LegendSectionType = 'discrete' | 'continuous';

export type LegendItem = {
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
  columns?: number;
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
};

export type LegendSection = DiscreteLegendSection | ContinuousLegendSection;
