import type { Snippet } from 'svelte';
import type { TimeValue } from '$lib/types/layout/timeline';
import type { LegendPlotContext } from '$lib/types/layout/legend';

export type ChartBoxContext = { width: number; height: number };
export type ChartBoxSnippet = Snippet<[ChartBoxContext]>;

export type ChartPlotContext<TRow extends Record<string, unknown>> = {
  data: TRow[];
  width: number;
  height: number;
  facetValue?: string;
  selectedValue?: TimeValue;
  legend?: LegendPlotContext;
};
export type ChartPlotSnippet<TRow extends Record<string, unknown>> = Snippet<
  [ChartPlotContext<TRow>]
>;
