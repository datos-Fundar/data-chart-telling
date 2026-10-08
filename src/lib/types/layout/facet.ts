import type { Snippet } from 'svelte';
import type { Accessor } from '$lib/types/plots/data/common';
import type { MarginConfig } from '$lib/types/plots/props';

export type Responsive<T> = T | { desktop: T; mobile: T };
export type FacetColumns = Responsive<number>;
export type FacetMode = 'grid' | 'carousel' | 'paginated';
export type FacetNavLayout = 'overlay' | 'below';

/**
 * Which position scales facets share: `'shared'` (default), `'free'`, or
 * `'free-x'`/`'free-y'` for one axis. In a `rows`/`cols` grid a free x is
 * shared down each column and a free y along each row.
 */
export type FacetScales = 'shared' | 'free' | 'free-x' | 'free-y';

/**
 * Which facets draw their axes: `'all'` (default), or `'outer'` for only the
 * left column's y and the bottom row's x, with panels resized to equal boxes.
 */
export type FacetAxes = 'all' | 'outer';

/** Where a facet sits in its grid - whether each of its sides is on the grid's outer edge. */
export type FacetEdges = { top: boolean; right: boolean; bottom: boolean; left: boolean };

export type FacetCellContext<TRow extends Record<string, unknown>> = {
  /** The facet's label: its `by` value, or its `rows`/`cols` values joined. */
  facetValue: string;
  /** The facet's `rows` value, in a `rows`/`cols` grid. */
  row?: string;
  /** The facet's `cols` value, in a `rows`/`cols` grid. */
  col?: string;
  data: TRow[];
  width: number;
  height: number;
  /** Margin sized off every facet's own natural need, per side - see `marginsForFacet`. Present only when it's given. */
  margins?: MarginConfig;
  /** Which of the facet's sides sit on the grid's outer edge. */
  edges: FacetEdges;
};
export type FacetCellSnippet<TRow extends Record<string, unknown>> = Snippet<
  [FacetCellContext<TRow>]
>;

export type FacetIndicatorContext = { current: number; total: number };
export type FacetIndicatorSnippet = Snippet<[FacetIndicatorContext]>;

export type FacetNavDirection = 'prev' | 'next';
export type FacetNavContext = { direction: FacetNavDirection; disabled: boolean; onclick: () => void };
export type FacetNavSnippet = Snippet<[FacetNavContext]>;

/** Options every facet layout shares. */
type FacetCommonConfig<TRow extends Record<string, unknown>> = {
  gap?: number;
  scales?: FacetScales;
  axes?: FacetAxes;
  /** One facet's own margin need per side; the largest per side is shared by every facet. */
  marginsForFacet?: (rows: TRow[]) => MarginConfig;
};

/** One facet per `by` value, wrapped into `columns` - laid out all at once, paged, or as a carousel. */
export type FacetWrapConfig<TRow extends Record<string, unknown>> = FacetCommonConfig<TRow> & {
  by: Accessor<TRow, unknown>;
  rows?: never;
  cols?: never;
  columns?: FacetColumns;
  values?: string[];
  mode?: Responsive<FacetMode>;
  visible?: number;
  pageSize?: number;
  navLayout?: FacetNavLayout;
  formatIndicator?: (current: number, total: number) => string;
  indicator?: FacetIndicatorSnippet;
  navButton?: FacetNavSnippet;
};

/** One facet per `rows` × `cols` combination, with each value labelled; combinations without rows stay empty. */
export type FacetGridConfig<TRow extends Record<string, unknown>> = FacetCommonConfig<TRow> & {
  by?: never;
  rows?: Accessor<TRow, unknown>;
  cols?: Accessor<TRow, unknown>;
  /** The `rows` values to show, in order. Defaults to every value, in data order. */
  rowValues?: string[];
  /** The `cols` values to show, in order. Defaults to every value, in data order. */
  colValues?: string[];
};

export type FacetConfig<TRow extends Record<string, unknown>> =
  | FacetWrapConfig<TRow>
  | FacetGridConfig<TRow>;
