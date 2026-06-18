import type { Snippet } from 'svelte';

/**
 * A field key or accessor function. Mirrors the shorthand used across plots
 * so chart-level encodings (`x`, `y`, `z`, facet, timeline) feel consistent
 * with the plot-level series definitions.
 */
export type Accessor<TRow extends Record<string, unknown>, V> =
  | keyof TRow
  | ((d: TRow) => V);

/** Value used to position and step a timeline (typically a year). */
export type TimeValue = number;

/** Orientation shared by the timeline and any orientation-aware layout. */
export type Orientation = 'horizontal' | 'vertical';

/** Number of facet columns, optionally responsive. */
export type FacetColumns = number | { desktop: number; mobile: number };

// ── Snippet contexts ──────────────────────────────────────────────────────────
// Each layout primitive renders its child through a snippet, receiving only the
// box it is allowed to draw into plus whatever slice of state it owns. This is
// what keeps the layers interchangeable: a primitive never needs to know what
// the leaf actually draws.

/** Box handed to the plot snippet by {@link ChartContainer}. */
export type ChartBoxContext = { width: number; height: number };
export type ChartBoxSnippet = Snippet<[ChartBoxContext]>;

/** Context handed to a facet cell by the facet grid. */
export type FacetCellContext<TRow extends Record<string, unknown>> = {
  facetValue: string;
  data: TRow[];
  width: number;
  height: number;
};
export type FacetCellSnippet<TRow extends Record<string, unknown>> = Snippet<
  [FacetCellContext<TRow>]
>;

/** Context handed to the timeline's child once a step is selected. */
export type TimelineChildContext<TRow extends Record<string, unknown>> = {
  selectedValue: TimeValue;
  data: TRow[];
  width: number;
  height: number;
};
export type TimelineChildSnippet<TRow extends Record<string, unknown>> = Snippet<
  [TimelineChildContext<TRow>]
>;

/**
 * Context handed to the leaf plot snippet by {@link Chart}. It collapses the
 * facet/timeline state into a single shape so a plot author only deals with
 * "here is some data and a box to draw it in".
 */
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

/** Timeline configuration passed to {@link Chart}. */
export type TimelineConfig<TRow extends Record<string, unknown>> = {
  /** How to read the time value (e.g. the year) from a row. */
  accessor: Accessor<TRow, TimeValue>;
  /** Scroll/scrubber progress in `[0, 1]`. */
  progress: number;
  /** Explicit ordered steps; inferred from the data when omitted. */
  values?: TimeValue[];
  orientation?: Orientation;
  /** Thickness in px of the timeline gutter (width if vertical, height if horizontal). */
  thickness?: number;
};

/** Facet configuration passed to {@link Chart}. */
export type FacetConfig<TRow extends Record<string, unknown>> = {
  by: Accessor<TRow, unknown>;
  columns?: FacetColumns;
  /** Optional ordering of facet values; inferred (sorted) when omitted. */
  values?: string[];
  gap?: number;
};
