import type { HoverDisplayPoint, HoverStrategy } from '$lib/types/layout/hover';
import type { HoverConfig, PointMatchingStrategy } from '$lib/types/plots/props';

/** Where a row sits for hover matching and the hover controller: its `x` and `y`. */
export type HoverPosition = {
	x: (row: never) => unknown;
	y: (row: never) => unknown;
};

/**
 * What differs between plots in the shared "hover" stage. Everything else -
 * which axis the pointer matches along, which rows can be hovered (a gap
 * row or a cell outside the legend's range can't), the rows themselves and
 * their series' colors - the stage reads off the plot's own state.
 */
export type HoverStageOptions<TState, TCtx = unknown> = {
	/**
	 * The hover strategy, when the plot's axes don't say it: along the axis
	 * that isn't measured, or `'punctual'` with both axes holding categories.
	 */
	strategy?: HoverStrategy;
	/** The rows the pointer hovers over, when they aren't the ones drawn (a box plot's one summary per box). Defaults to the processed rows. */
	rows?: (state: TState) => Record<string | symbol, unknown>[];
	/** How a hovered row reads in the tooltip unless the author sets `format`. Defaults to the shared tooltip text. */
	format?: (state: TState) => (row: never) => string;
	/** The order a tooltip's rows read in. Defaults to the shared order: highest value first. */
	sort?: (state: TState) => (a: never, b: never) => number;
	/** Where a row sits. Defaults to its processed position: a stacked row's top, a bin's centre. */
	position?: (state: TState) => HoverPosition;
	/** The short label drawn next to a hovered row. Defaults to its value. */
	label?: (state: TState) => (row: never) => string;
	/** What a hovered row reads as, e.g. with derived fields added. Defaults to the processed row. */
	row?: (state: TState) => (row: never) => unknown;
	/** Fields a candidate carries besides its place, label and series color (a grouped bar's `dx`/`dy`). */
	decorate?: (
		state: TState,
		ctx: TCtx
	) => (row: never) => Partial<Omit<HoverDisplayPoint, 'x' | 'y' | 'label'>>;
	/** Invisible markers that drive the plot's hover themselves (a bar's band), given its resolved hover config. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	hitAreas?: (state: TState, hover: HoverConfig<any>, ctx: TCtx) => { type: string }[];
	/** How a pointer event resolves to a candidate. Defaults to the nearest one. */
	pointMatching?: PointMatchingStrategy;
};
