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
};

/** A plot kind's own context of a row: the shared one, with what the kind works out for it. */
export type KindRowContext<
	TExtra extends object,
	TRow = Record<string, unknown>
> = PlotRowContext<TRow> & TExtra;
