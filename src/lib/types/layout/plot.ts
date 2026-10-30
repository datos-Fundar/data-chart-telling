import type { Snippet } from 'svelte';
import type { TimeValue } from '$lib/types/layout/timeline';
import type { GridPlacement } from '$lib/types/layout/grid';
import type {
	MarginConfig,
	TooltipConfig,
	HoverConfig as PlotHoverConfig
} from '$lib/types/plots/props';
import type { Margins as MarginsType } from '$lib/layout/margins/Margins';
import type { EdgeBox } from '$lib/types/layout/box';
import type { StylesLayoutConfig } from '$lib/types/layout/styles';
import type { HoverPosition } from '$lib/types/phases';
import type { PlotAxes } from '$lib/phases/data/PlotAxes';

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
	/** Where this slice sits among the facet panels - `undefined` when the plot has no facet. */
	facet?: NonNullable<SlicePlace['facet']>;
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

/**
 * What `BasePlotLayout` draws from: the end of a plot's pipeline. An axis
 * kind's state is one as is; GeoPlot builds its own.
 */
export type PlotLayoutState = {
	/** What the pointer can match, and how the hover reads. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	hover?: PlotHoverConfig<any>;
	/** Where each row sits, for hover matching and the plot's scales. */
	hoverPosition?: HoverPosition;
	/** The rows the plot draws and hovers over. */
	hoverRows?: unknown[];
	/** The plot's x/y/r/length scales, and the scales a marker without its own inherits. */
	scales?: object;
	/** The axes whose domain the plot kind fit itself rather than the author pinned. */
	fittedAxes?: string[];
	/** What the plot's position channels are and which way it runs, for what draws inside it. */
	axes?: PlotAxes;
	/** The plot's channels as given, whose field titles an axis with no rows. */
	channels?: Record<string, { source?: unknown } | undefined>;
	/** Every marker the pipeline resolved. */
	markers?: object[];
	/** All resolved series - axis kinds only. */
	resolvedSeries?: object[];
	/** Each series' color, by name - axis kinds only. */
	colorForSeries?: (name: string) => string;
	/** Per-series marker groups - axis kinds only. */
	scopedGroups?: object[];
	/** The plot's `styles`: its frame and, on a map, its tile layer. */
	styles?: StylesLayoutConfig;
	/** What an `'auto'` margin side reads as. Defaults to {@link Margins.AXIS_ESTIMATE}. */
	marginEstimate?: MarginsType;
	/** The plot's value labels, whose `reach` is the room the margins start from. */
	valueLabels?: { reach: EdgeBox[] };
};
