import type { Snippet } from 'svelte';
import type { AxisValue } from '$lib/types/layout/scales';
import type { Accessor } from '$lib/types/plots/data/common';
import type { EasingName, EasingFn } from '$lib/types/charts/interpolate';

export type TimeValue = number;
export type Orientation = 'horizontal' | 'vertical';
export type Responsive<T> = T | { desktop: T; mobile: T };
export type FacetColumns = Responsive<number>;
export type FacetMode = 'grid' | 'carousel' | 'paginated';

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

export type FacetIndicatorContext = { current: number; total: number };
export type FacetIndicatorSnippet = Snippet<[FacetIndicatorContext]>;

export type FacetNavDirection = 'prev' | 'next';
export type FacetNavContext = { direction: FacetNavDirection; disabled: boolean; onclick: () => void };
export type FacetNavSnippet = Snippet<[FacetNavContext]>;

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
  mode?: Responsive<FacetMode>;
  visible?: number;
  pageSize?: number;
  formatIndicator?: (current: number, total: number) => string;
  indicator?: FacetIndicatorSnippet;
  navButton?: FacetNavSnippet;
};
