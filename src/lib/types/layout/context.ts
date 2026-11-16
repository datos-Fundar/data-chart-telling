import type { Component, ComponentProps } from 'svelte';
/**
 * What a plot knows of one of the rows it draws: the series it is drawn in, where it sits, and the value it shows
 * - the dataset's own, or the one the plot works out for it (a density's estimate, a bin's count). It is worked
 * out once per row, as the plot reads its data, and every place that writes about a row reads it: a tooltip's
 * `format`, a hover's points and labels, the value labels, and an author's own markers (see `RowContext.of`).
 * A plot kind that works out more about a row gives a type that extends this one.
 */
export type PlotRowContext<TRow = Record<string, unknown>> = {
	/** The name of the series the row is drawn in, on the plots that have series. */
	series?: string;
	/** The row's value on `x`: its own (not a stack's running total), else where the plot's transforms put it. */
	x?: unknown;
	/** The row's value on `y`, as `x`. */
	y?: unknown;
	/** The value the row shows, on the plot's value axis, when it is a number. */
	value?: number;
	/** The row itself, as the plot drew it: the data's fields, plus whatever its transforms added. */
	row?: TRow;
	/** Which of the row's values a label writes, on a plot whose rows have several (`styles.values.parts`). */
	part?: string;
	/** The row's place among the rows a marker draws, in that marker's own accessors and styles. */
	index?: number;
};

/** A plot kind's own context of a row: the shared one, with what the kind works out for it. */
export type KindRowContext<
	TExtra extends object,
	TRow = Record<string, unknown>
> = PlotRowContext<TRow> & TExtra;

/**
 * The context of a row in a marker the plot's own code reads: by then its author's functions have been given
 * theirs, so a {@link RowFunction} of it takes the row alone too. Every marker type defaults to it; a plot kind's
 * props give their own context instead.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRowContext = any;

/**
 * A value read off each row a marker, a style or a transform draws: from the row, and what the plot knows of it
 * (`TContext`, the plot kind's own context of a row, with the row's place among the marker's in `index`).
 */
export type RowFunction<T, TContext extends PlotRowContext = AnyRowContext> = 0 extends 1 & TContext
	? (row: any, context?: any) => T // eslint-disable-line @typescript-eslint/no-explicit-any
	: (row: any, context: TContext) => T; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * What a plot kind knows of each row it draws, named from its component: `RowContextOf<typeof HistogramPlot>`, with
 * its `row` typed as the plot's rows. Every callback a plot takes already gets it typed; this names it where nothing
 * ties the code to its plot, such as `usePlot().contextOf(row)` in a `component` marker.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RowContextOf<TPlot extends Component<any, any>> = Parameters<
	NonNullable<Extract<NonNullable<ComponentProps<TPlot>['tooltip']>, object>['format']>
>[0];
