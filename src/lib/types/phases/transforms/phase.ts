import type { Series } from '$lib/types/plots/data/common';
import type { MarkerTransform } from '$lib/types/transforms';
import type { PlotAxes } from '$lib/phases/data/PlotAxes';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { ValuesStyle, ValueSelect } from '$lib/types/layout/styles';

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
	axes?: PlotAxes;
	/** Each series' gap fills, by series id: the value each missing row is drawn at. */
	gapFillMaps?: Map<string, Map<unknown, { value: number; kind: string }>>;
	transforms?: MarkerTransform[];
	processedData?: ProcessedData;
	/** The plot's `styles.values`, which picks the rows its labels are written for. */
	values?: ValuesStyle;
	/** The processed rows `styles.values` labels, once the labels are on and the plot picks them (see {@link TransformsStageOptions.labels}). */
	labelled?: ProcessedRow[];
	/** What `styles.values.select` came to - the author's, else the plot's default - which says where the labelled rows can sit. */
	labelSelects?: ValueSelect[];
	/** The processed rows split back into the visual groups the plot's own marks draw. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	processedGroups?: VisualGroup<Series<ProcessedRow>, any>[];
};

/** What differs between plots in the shared "transforms" stage. */
export type TransformsStageOptions<TState extends TransformsStageState, TCtx> = {
	/** The transforms to run. Defaults to the plot's own `transforms`. */
	transforms?: (state: TState, ctx: TCtx) => MarkerTransform[];
	/**
	 * How the processed rows split into `processedGroups`: one group per series
	 * (the default), or `'runs'` of consecutive rows from the same series, in
	 * the rows' own order, so a reordering transform (`sort`, `reverse`,
	 * `shuffle`) decides which rows paint on top.
	 */
	groups?: 'series' | 'runs';
	/**
	 * The plot picks the rows its value labels are written for, when the labels
	 * are on: `styles.values.select` and `series` run as transforms over the
	 * processed rows, into `labelled`.
	 */
	labels?: {
		/** The rows picked when `styles.values.select` is unset. Defaults to every row. */
		select?: ValueSelect | ValueSelect[];
		/** What a selector picks among: each series (the default), or each category. */
		group?: 'series' | 'category';
		/** A test for the rows that cannot be labelled (a gap), read off the state once. */
		skip?: (state: TransformsStageState) => (row: ProcessedRow) => boolean;
	};
};
