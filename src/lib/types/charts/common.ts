import type { Snippet } from 'svelte';
import type { AxisValue } from '$lib/types/plots/axis';
import type { Accessor } from '$lib/types/plots/data/common';
import type { EasingName, EasingFn } from '$lib/types/charts/interpolate';

export type TimeValue = number;
export type Orientation = 'horizontal' | 'vertical';
export type FacetColumns = number | { desktop: number; mobile: number };

export type ChartBoxContext = { width: number; height: number };
export type ChartBoxSnippet = Snippet<[ChartBoxContext]>;

export type FacetCellContext<TRow extends Record<string, unknown>> = {
  facetValue: string;
  data: TRow[];
  width: number;
  height: number;
};
export type FacetCellSnippet<TRow extends Record<string, unknown>> = Snippet<
  [FacetCellContext<TRow>]
>;

export type TimelineChildContext<TRow extends Record<string, unknown>> = {
  selectedValue: TimeValue;
  data: TRow[];
  width: number;
  height: number;
};
export type TimelineChildSnippet<TRow extends Record<string, unknown>> = Snippet<
  [TimelineChildContext<TRow>]
>;

export type ChartPlotContext<TRow extends Record<string, unknown>> = {
  data: TRow[];
  width: number;
  height: number;
  facetValue?: string;
  selectedValue?: TimeValue;
};
export type ChartPlotSnippet<TRow extends Record<string, unknown>> = Snippet<
  [ChartPlotContext<TRow>]
>;

export type TimelineInterpolation<TRow extends Record<string, unknown>> = {
  key?: Accessor<TRow, unknown>;
  value?: Accessor<TRow, AxisValue>;
  create?: (lower: TRow, upper: TRow, x: TimeValue, value: number) => TRow;
  progressEasing?: EasingName | EasingFn;
  segmentEasing?: EasingName | EasingFn;
};

export type TimelineConfig<TRow extends Record<string, unknown>> = {
  accessor: Accessor<TRow, TimeValue>;
  progress: number;
  values?: TimeValue[];
  orientation?: Orientation;
  show?: boolean;
  thickness?: number;
  filterMode?: 'exact' | 'upTo';
  interpolate?: boolean | TimelineInterpolation<TRow>;
};

export type FacetConfig<TRow extends Record<string, unknown>> = {
  by: Accessor<TRow, unknown>;
  columns?: FacetColumns;
  values?: string[];
  gap?: number;
};
