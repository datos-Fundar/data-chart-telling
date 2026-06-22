import type { Snippet } from 'svelte';
import type { Accessor } from '$lib/types/plots/common';
import type { EasingName, EasingFn } from '$lib/types/charts/interpolate';

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

/**
 * Smoothly tweens a value between the two real steps bracketing the current
 * scrub position instead of snapping to whichever step is nearest. Rows are
 * grouped by `key` (e.g. a series or category) and tweened independently
 * within each group — mirrors a scrolly-telling pattern where a line's
 * leading edge (or a bar's height) moves continuously between known points.
 */
export type TimelineInterpolation<TRow extends Record<string, unknown>> = {
  /**
   * Groups rows into independent tween tracks (a series or category key).
   * Rows only tween against others sharing the same key. Defaults to one
   * shared track when omitted.
   */
  key?: Accessor<TRow, unknown>;
  /**
   * Numeric field tweened between the two bracketing rows. `LineChart`/
   * `BarChart` default this to their own `y` when omitted.
   */
  value?: Accessor<TRow, number>;
  /**
   * Builds the synthetic in-between row. Defaults to cloning the upper row
   * with the time field and `value` field overwritten — that default only
   * works when `accessor` and `value` are plain field names, not function
   * accessors.
   */
  create?: (lower: TRow, upper: TRow, x: TimeValue, value: number) => TRow;
  /** Eases the overall scrub `progress` across the full step domain. Defaults to linear. */
  progressEasing?: EasingName | EasingFn;
  /** Eases the tween within the pair of steps currently bracketing the scrub position. Defaults to linear. */
  segmentEasing?: EasingName | EasingFn;
};

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
  /**
   * How the timeline filters `data` for the selected step. `'exact'`
   * (default) keeps only rows matching the step — a snapshot, right for bar
   * and heatmap. `'upTo'` keeps every row at or before the step — a
   * cumulative reveal, right for a line that should grow over time.
   */
  filterMode?: 'exact' | 'upTo';
  /**
   * Tween between real steps instead of snapping. `true` uses the chart's
   * own defaults (its `y` as the tweened value, its `z` — or category, for
   * bars — as the grouping key); pass an object to customise keying/easing.
   */
  interpolate?: boolean | TimelineInterpolation<TRow>;
};

/** Facet configuration passed to {@link Chart}. */
export type FacetConfig<TRow extends Record<string, unknown>> = {
  by: Accessor<TRow, unknown>;
  columns?: FacetColumns;
  /** Optional ordering of facet values; inferred (sorted) when omitted. */
  values?: string[];
  gap?: number;
};
