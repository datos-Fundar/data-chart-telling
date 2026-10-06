import type { Series } from '$lib/types/plots/data/common';
import type { MarkerTransform } from '$lib/types/transforms';

/** A row the plot-level transforms produced: the source row's fields, plus whatever channels they add (often symbol-keyed). */
export type ProcessedRow = Record<string | symbol, unknown>;

/** A channel as svelteplot reads it off a processed row: a field key, a symbol key, or a function. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ProcessedChannel = string | symbol | ((row: any) => unknown);

/** The position channels a processed row can carry. */
export type ProcessedChannelName = 'x' | 'y' | 'x1' | 'x2' | 'y1' | 'y2';

/**
 * Every visible series' rows after the plot-level transforms, as one set.
 * With no transforms, they're the source rows read by the series' own `x`/`y`.
 */
export type ProcessedData = {
	/** Every row, each tagged with its series name under `SERIES_KEY`. */
	data: ProcessedRow[];
	/** The channels that read those rows: the series' `x`/`y`, or what the transforms set (`x1`/`x2`, `y1`/`y2`…). */
	channels: Partial<Record<ProcessedChannelName, ProcessedChannel>>;
	/** The transforms' own mark options (e.g. a bin's insets), for the marks that draw these rows. */
	options: Record<string, unknown>;
	/** The transforms the rows went through, so a mark can apply each type's `finish` fix. */
	transforms: MarkerTransform[];
};

/** What the shared "transforms" stage reads from and writes to a plot's state. */
export type TransformsStageState = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	resolvedSeries?: Series<any>[];
	transforms?: MarkerTransform[];
	processedData?: ProcessedData;
};

/** What differs between plots in the shared "transforms" stage. */
export type TransformsStageOptions<TState extends TransformsStageState, TCtx> = {
	/** The transforms to run. Defaults to the plot's own `transforms`. */
	transforms?: (state: TState, ctx: TCtx) => MarkerTransform[];
	/** Extra fields to tag one source row with before the transforms run. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	tagRow?: (row: any, series: Series<any>, state: TState) => ProcessedRow;
	/** Replaces the `y` channel the transforms read, given the series' own. */
	y?: (y: ProcessedChannel, state: TState) => ProcessedChannel;
};
