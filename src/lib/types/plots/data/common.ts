import type { AxisValue, AxisChannelName, ChannelAccessors } from '$lib/types/layout/mapping';

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

/** The channels a pre-built {@link Series} carries itself, so a plot given `series` takes none of them. */
type SeriesChannelName = AxisChannelName | 'color' | 'grouping';

/**
 * Pre-built series. Mutually exclusive with {@link DataProps} — takes
 * precedence when both could apply. Any channel a series doesn't carry
 * itself is still a plot-level prop.
 */
export type SeriesProps<T extends Record<string, unknown>> = {
	series: Series<T>[];
	data?: never;
} & { [K in SeriesChannelName]?: never } & Omit<ChannelAccessors<T>, SeriesChannelName>;

/**
 * Flat rows to group into series, as an alternative to {@link SeriesProps}.
 * Takes every channel; `x`/`y` are required.
 */
export type DataProps<T extends Record<string, unknown>> = {
	series?: never;
	data: T[];
} & ChannelAccessors<T> &
	Required<Pick<ChannelAccessors<T>, AxisChannelName>>;
