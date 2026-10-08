import type { Snippet } from 'svelte';
import type { HoverStrategy } from '$lib/types/layout/tooltip';
import type { AxisChannelName, AxisValue } from '$lib/types/layout/mapping';
import type { Accessor } from '$lib/types/plots/data/common';
import type { MarginConfig, TooltipConfig } from '$lib/types/plots/props';

/**
 * What a plot kind tells its shell before its pipeline runs: its hover and
 * timeline defaults, and how its slices share scales. A tooltip's default
 * text is the pipeline's own output instead.
 */
export type PlotPresentation<
	TRow extends Record<string, unknown>,
	TScales extends object = object
> = {
	/** Hover strategy when neither `tooltip` nor a hover marker sets one. */
	hoverStrategy: HoverStrategy;
	timeline?: {
		/** Default for `timeline.filterMode`. */
		filterMode?: 'exact' | 'upTo';
		/** How a tweened timeline matches rows across steps, unless `timeline.interpolate` says otherwise. */
		interpolation?: { value: Accessor<TRow, AxisValue>; key?: Accessor<TRow, unknown> };
	};
	/** Scales computed over every row before slicing, so each slice keeps the same frame. Author `scales` win. */
	sliceScales?: (rows: TRow[]) => TScales;
	/** Where one facet's rows sit on each axis, so facets can share a domain. Without it, facets never share position scales. */
	facetAxisValues?: (rows: TRow[]) => FacetAxisValues;
};

/** Every value one facet places on each axis, and how its kind lays those axes out. */
export type FacetAxisValues = {
	x: unknown[];
	y: unknown[];
	/** Axes laid out as bands (categories). */
	band: AxisChannelName[];
	/** Axes whose domain must include zero. */
	zero: AxisChannelName[];
};

/** What a plot shell hands each core it renders: one slice's rows and box. */
export type PlotCellContext<
	TRow extends Record<string, unknown>,
	TScales extends object = object
> = {
	/** This slice's rows - `undefined` when the plot draws from pre-built `series`. */
	data: TRow[] | undefined;
	width: number;
	height: number;
	/** Shared margin for every facet, when the facet config sizes one. */
	margins?: MarginConfig;
	tooltip?: TooltipConfig<TRow>;
	/** Scales every slice shares, to merge under the author's own. */
	scales?: TScales;
	/** Whether any row - the plot's own or a marker's - belongs in this slice; rows without a slicing field belong in all. */
	keep: (row: TRow) => boolean;
};
export type PlotCellSnippet<
	TRow extends Record<string, unknown>,
	TScales extends object = object
> = Snippet<[PlotCellContext<TRow, TScales>]>;

/** A box measured for a plot to draw into. */
export type PlotBoxContext = { width: number; height: number };
export type PlotBoxSnippet = Snippet<[PlotBoxContext]>;

/** What a plot shell reads off a plot kind's core props. */
export type PlotShellCoreProps = {
	width: number;
	height: number;
	data?: unknown;
	markers?: { type: string }[];
	scales?: object;
	margins?: MarginConfig;
};
