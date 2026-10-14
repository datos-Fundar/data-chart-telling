import type { Pipeline } from '$lib/phases/Pipeline';
import type { Snippet } from 'svelte';
import type { TooltipOptions, TooltipProp } from '$lib/types/layout/tooltip';
import type { HoverPoint, HoverStrategy } from '$lib/types/layout/hover';
import type { LegendExtension, LegendSection } from '$lib/types/layout/legend';
import type { FacetConfig } from '$lib/types/layout/facet';
import type { GridPlacement } from '$lib/types/layout/grid';
import type { TimelineConfig } from '$lib/types/layout/timeline';
import type { Segment } from '$lib/types/plots/segments/config';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { GeoScalesConfig } from '$lib/types/layout/coordinates';
import type { StatisticConfig } from '$lib/types/layout/statistics';
import type { MarkerTransform } from '$lib/types/transforms';

/** The `styles` prop accepted by every plot kind - its own
 * styles shape ({@link AxisBasedStylesConfig}, `GeoStylesConfig`, …). */
export type StylesConfig<TStyles extends object> = TStyles;

/** The `markers` prop accepted by every plot kind - a list of that kind's own marker union. */
export type MarkersConfig<TMarker> = TMarker[];

/**
 * The `segments` prop - series name (or `'default'`) to its {@link Segment}s.
 * Area-specific segments win over catch-all ones.
 */
export type SegmentsConfig<TStyle> = Record<string, Segment<TStyle>[]>;

/** One side of a box. */
export type MarginSide = 'top' | 'right' | 'bottom' | 'left';

/** Margin overrides per side: a number pins it, `'auto'` fits it to its content. Unset sides use the theme's. */
export type MarginConfig = Partial<{
	top: number | 'auto';
	right: number | 'auto';
	bottom: number | 'auto';
	left: number | 'auto';
}>;

/** The tooltip a plot's core draws from: {@link TooltipOptions} with `sync` resolved. Without `format`, the core uses its own default. */
export type TooltipConfig<TRow extends Record<string, unknown>> = Omit<TooltipOptions<TRow>, 'sync'> & {
	sync: boolean;
};

/** How a pointer event resolves to a candidate point: `'nearest'` (closest within a distance threshold) or `'contains'` (whichever candidate's own rendered shape contains the cursor). */
export type PointMatchingStrategy = 'nearest' | 'contains';

/** `BasePlotLayout`'s single `hover` prop - every plot kind's own resolved hover/tooltip wiring. */
export type HoverConfig<TRow extends Record<string, unknown>> = {
	/** Whether the pointer/hover/tooltip machinery should mount at all. */
	active: boolean;
	/** Candidate points hover matching searches against. */
	points: HoverPoint<TRow>[];
	/** Short label drawn next to the highlight dot (e.g. the value). */
	label: (row: TRow) => string;
	/** Resolved hover strategy for the *local* hover store (ignored once a shared store is in scope). */
	strategy?: HoverStrategy;
	/** Resolved sync flag for the *local* hover store (ignored once a shared store is in scope). */
	sync?: boolean;
	tooltip?: TooltipConfig<TRow> & { format: (row: TRow) => string };
	/** When it returns `true`, that pointer event is treated as a leave instead of a move - lets a nested layout opt part of the plot out of hover matching. */
	exclude?: (e: PointerEvent) => boolean;
	/** How to resolve a pointer event to a candidate point - see {@link PointMatchingStrategy}. Defaults to `'nearest'`. */
	pointMatching?: PointMatchingStrategy;
	/** Forces the crosshair rule(s) a `hover` marker draws off entirely, overriding whatever `strategy` implies. */
	crosshair?: boolean;
};

/** The `scales` prop of any plot kind. */
export type ScalesConfig<TData = Record<string, unknown>> =
	| AxisBasedScalesConfig<TData>
	| GeoScalesConfig;

/**
 * A block a plot's chrome draws, `plot` for the plot itself, or `divider` for
 * a line between two blocks, styled by the configuration's `divider`.
 */
export type PlotChromeItem =
	| 'title'
	| 'subtitle'
	| 'header'
	| 'legend'
	| 'plot'
	| 'caption'
	| 'footer'
	| 'divider';

/**
 * What's drawn around a figure, as `Figure` and `FigureChrome` read it: every block
 * optional, `header` drawn instead of `title`/`subtitle` and `footer` instead
 * of `caption`. `order` lists the blocks top to bottom (by default, the
 * configuration's `chrome.order`); one left out isn't drawn, except `plot`, which then
 * goes last. Any number of `divider`s may sit in it, each drawn only between
 * two drawn blocks.
 */
export type PlotChromeConfig = {
	title?: string;
	subtitle?: string;
	caption?: string;
	header?: Snippet;
	footer?: Snippet;
	/**
	 * The figure's legend: unset or `true`, the one its plots read as - their
	 * series, scales, and the segments and markers that name themselves; `false`,
	 * none; a list of sections, exactly those; `{ items, sections }`, the
	 * automatic one with those added.
	 */
	legend?: LegendSection[] | LegendExtension | boolean;
	order?: PlotChromeItem[];
};

/**
 * One way to fill part of the chrome, and the `order` items it allows. A block
 * that's passed may still be `undefined` at runtime: it's then just not drawn.
 */
type ChromeBlock<TProps, TItem extends PlotChromeItem> = { props: TProps; item: TItem };

type HeadingBlock =
	| ChromeBlock<{ header: Snippet | undefined; title?: never; subtitle?: never }, 'header'>
	| ChromeBlock<
			{ header?: never; title: string | undefined; subtitle: string | undefined },
			'title' | 'subtitle'
	  >
	| ChromeBlock<{ header?: never; title: string | undefined; subtitle?: never }, 'title'>
	| ChromeBlock<{ header?: never; title?: never; subtitle: string | undefined }, 'subtitle'>
	| ChromeBlock<{ header?: never; title?: never; subtitle?: never }, never>;

type LegendBlock =
	| ChromeBlock<{ legend: LegendSection[] | LegendExtension | boolean | undefined }, 'legend'>
	| ChromeBlock<{ legend?: never }, never>;

type ClosingBlock =
	| ChromeBlock<{ footer: Snippet | undefined; caption?: never }, 'footer'>
	| ChromeBlock<{ footer?: never; caption: string | undefined }, 'caption'>
	| ChromeBlock<{ footer?: never; caption?: never }, never>;

/** Every combination of the three parts, each with an `order` of only the blocks it fills, plus `plot` and dividers. */
type ChromeCombination<THeading, TLegend, TClosing> =
	THeading extends ChromeBlock<infer HP, infer HI>
		? TLegend extends ChromeBlock<infer LP, infer LI>
			? TClosing extends ChromeBlock<infer CP, infer CI>
				? HP & LP & CP & { order?: (HI | LI | CI | 'plot' | 'divider')[] }
				: never
			: never
		: never;

/**
 * What's drawn around a plot: accepted by every plot kind and by
 * `PlotComposer`. `header` replaces `title`/`subtitle` and `footer`
 * replaces `caption`, so each excludes the other. `order` lists the blocks
 * top to bottom, out of the ones set here plus `plot` and `divider`; see {@link PlotChromeConfig}.
 */
export type PlotChromeProps = ChromeCombination<HeadingBlock, LegendBlock, ClosingBlock>;

/** The props every plot kind shares between its core and its public component. */
type PlotCommonProps<
	TStyles extends object,
	TSegmentStyle extends object,
	TMarker,
	TScales,
	TCoordinates
> = {
	width: number;
	height: number;
	styles?: StylesConfig<TStyles>;
	segments?: SegmentsConfig<TSegmentStyle>;
	markers?: MarkersConfig<TMarker>;
	scales?: TScales;
	coordinates?: TCoordinates;
	margins?: MarginConfig;
	statistics?: StatisticConfig[];
	transforms?: MarkerTransform[];
};

/** The props a plot kind's core draws from. `TCoordinates` is only set by `GeoPlot`. */
export type PlotCoreProps<
	TDataContract,
	TRow extends Record<string, unknown>,
	TStyles extends object,
	TSegmentStyle extends object,
	TMarker,
	TScales extends ScalesConfig<TRow>,
	TCoordinates = undefined
> = TDataContract &
	PlotCommonProps<TStyles, TSegmentStyle, TMarker, TScales, TCoordinates> & {
		tooltip?: TooltipConfig<TRow>;
		/** One facet panel's part of a run of the data phases over every panel: the core then runs only the phases after them. */
		panelState?: object;
		/** The kind's pipeline, built once by its plot: the core runs it over its own props. */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		pipeline?: Pipeline<any, any>;
	};

/**
 * A figure's box - a plot's or a `PlotComposer`'s: its own `width` and
 * `height`, or, drawn straight inside a `PlotComposer`, the cell it takes
 * there (an `area`, or an `inset` floating over it), whose size it draws at.
 */
export type FigureBoxProps = GridPlacement & { width?: number; height?: number };

/** A plot component's public props: its core props, chrome, `timeline`, `facet` and an author-facing `tooltip`. */
export type BasePlotProps<
	TDataContract,
	TRow extends Record<string, unknown>,
	TStyles extends object,
	TSegmentStyle extends object,
	TMarker,
	TScales extends ScalesConfig<TRow>,
	TCoordinates = undefined
> = TDataContract &
	Omit<PlotCommonProps<TStyles, TSegmentStyle, TMarker, TScales, TCoordinates>, 'width' | 'height'> &
	FigureBoxProps &
	PlotChromeProps & {
		tooltip?: TooltipProp<TRow>;
		timeline?: TimelineConfig<TRow>;
		facet?: FacetConfig<TRow>;
	};
