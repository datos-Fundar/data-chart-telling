import type { AxisValue } from '$lib/types/layout/scales';

/**
 * A field key or accessor function. Mirrors the shorthand used across plots
 * so chart-level encodings (`x`, `y`, `color`, facet, timeline) feel
 * consistent with the plot-level series definitions.
 */
export type Accessor<TRow extends Record<string, unknown>, V> = keyof TRow | ((d: TRow) => V);

/**
 * A plot series: a name, x/y accessors and the rows it draws. Shared as-is by
 * every mark (line, bar, …) — none of them need anything beyond this shape;
 * visual styling lives separately in `segments`.
 */
export type Series<T extends Record<string, unknown> = Record<string, unknown>> = {
	name: string;
	x: Accessor<T, AxisValue>;
	y: Accessor<T, AxisValue>;
	/** The `color` channel's own accessor — a pre-built series is already one group, so this is purely the color value (per-name for most plot kinds; per-cell for HeatmapPlot). */
	color?: Accessor<T, unknown>;
	data: T[];
};

/**
 * Pre-built series. Mutually exclusive with {@link DataProps} — takes
 * precedence when both could apply.
 */
export type SeriesProps<T extends Record<string, unknown>> = {
	series: Series<T>[];
	data?: never;
	x?: never;
	y?: never;
	grouping?: never;
	color?: never;
	opacity?: never;
};

/**
 * Flat rows to group into series, as an alternative to {@link SeriesProps}.
 */
export type DataProps<T extends Record<string, unknown>> = {
	series?: never;
	data: T[];
	x: Accessor<T, AxisValue>;
	y: Accessor<T, AxisValue>;
	/**
	 * Splits `data` into one series per distinct value — the structural
	 * grouping key. Defaults to `color` when omitted, so a single `color`
	 * accessor groups *and* colors series exactly as it always has; pass both
	 * to split by one field while coloring by another (e.g. `scales.color`
	 * driving a continuous ramp independent of how series are grouped).
	 */
	grouping?: Accessor<T, unknown>;
	/**
	 * Splits `data` into one series per distinct value when `grouping`
	 * is unset — see `scales.color` to configure each series' own color.
	 */
	color?: Accessor<T, unknown>;
	/** Continuous or categorical opacity-value accessor — configure the ramp via `scales.opacity`. Independent of `color`/`grouping`. */
	opacity?: Accessor<T, unknown>;
};
