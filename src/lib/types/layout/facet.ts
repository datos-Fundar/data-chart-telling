import type { Snippet } from 'svelte';
import type { Accessor } from '$lib/types/plots/data/common';
import type { MarginConfig } from '$lib/types/plots/props';

export type Responsive<T> = T | { desktop: T; mobile: T };
export type FacetColumns = Responsive<number>;
export type FacetMode = 'grid' | 'carousel' | 'paginated';
export type FacetNavLayout = 'overlay' | 'below';

export type FacetCellContext<TRow extends Record<string, unknown>> = {
  facetValue: string;
  data: TRow[];
  width: number;
  height: number;
  /** Left margin sized to the widest label across every facet — see `labelsForMargin`. Present only when it's given. */
  margins?: MarginConfig;
};
export type FacetCellSnippet<TRow extends Record<string, unknown>> = Snippet<
  [FacetCellContext<TRow>]
>;

export type FacetIndicatorContext = { current: number; total: number };
export type FacetIndicatorSnippet = Snippet<[FacetIndicatorContext]>;

export type FacetNavDirection = 'prev' | 'next';
export type FacetNavContext = { direction: FacetNavDirection; disabled: boolean; onclick: () => void };
export type FacetNavSnippet = Snippet<[FacetNavContext]>;

export type FacetConfig<TRow extends Record<string, unknown>> = {
  by: Accessor<TRow, unknown>;
  columns?: FacetColumns;
  values?: string[];
  gap?: number;
  mode?: Responsive<FacetMode>;
  visible?: number;
  pageSize?: number;
  navLayout?: FacetNavLayout;
  formatIndicator?: (current: number, total: number) => string;
  indicator?: FacetIndicatorSnippet;
  navButton?: FacetNavSnippet;
  /** Candidate label strings for one facet's own rows — measured across every facet to size a shared left margin (`cell`'s own `margins`). */
  labelsForMargin?: (rows: TRow[]) => string[];
};
