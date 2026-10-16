import type { Snippet } from 'svelte';

/** A box measured for a plot to draw into. */
export type PlotBoxContext = { width: number; height: number };
export type PlotBoxSnippet = Snippet<[PlotBoxContext]>;
