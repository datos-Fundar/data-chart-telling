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
  /** Margin sized off every facet's own natural need, per side — see `marginsForFacet`. Present only when it's given. */
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
  /**
   * One facet's own natural margin need, per side — measured across every
   * facet and combined with `Math.max` per side (`FacetLayout`'s own
   * `cellMargins`) to size one shared margin every facet's `cell` receives
   * through its own `margins`, instead of each facet growing its own margin
   * independently off what its own content happens to need (which drifts
   * out of alignment facet to facet, and — for a facet cramped enough that
   * its content can never fully fit — can grow without bound). A plot type
   * that draws content needing this (a categorical axis's labels, a value
   * label's own text) implements this by calling its own margin-estimating
   * export against the facet's rows — e.g. `BarPlot`'s left margin from its
   * category labels, `LinePlot`'s right margin from its end-of-line value
   * labels (see each plot's own docs for what its estimator assumes, such as
   * `LinePlot`'s one-line-per-facet caveat) — this callback only carries
   * that per-facet result up to where every facet's results can be compared.
   * Any side left unset by every facet stays unpinned, falling back to the
   * plot's own default (`'auto'`) sizing.
   */
  marginsForFacet?: (rows: TRow[]) => MarginConfig;
};
