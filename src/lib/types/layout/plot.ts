import type { Snippet } from 'svelte';
import type { TimeValue } from '$lib/types/layout/timeline';
import type { GridPlacement } from '$lib/types/layout/grid';
import type { MarginConfig, TooltipConfig } from '$lib/types/plots/props';

/** Where one cell sits among the slices: the timeline step and the facet it shows. */
export type SlicePlace = {
	time?: TimeValue;
	facet?: { facetValue: string; row?: string; col?: string };
};

/** What `Plot` hands each core it renders: one slice's rows and box. */
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
	/** This slice's facet panel, as a {@link Pipeline.runData} over every panel resolved it. */
	panel?: object;
	/** Whether any row - the plot's own or a marker's - belongs in this slice; rows without a slicing field belong in all. */
	keep: (row: TRow) => boolean;
};
export type PlotCellSnippet<
	TRow extends Record<string, unknown>,
	TScales extends object = object
> = Snippet<[PlotCellContext<TRow, TScales>]>;

/** What `Plot` reads off a plot kind's core props. */
export type PlotCoreBase = GridPlacement & {
	width: number;
	height: number;
	data?: unknown;
	markers?: { type: string }[];
	scales?: object;
	margins?: MarginConfig;
};
