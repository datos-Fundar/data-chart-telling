import type {
	AxisValue,
	AxisChannelName,
	ChannelAccessors,
	ChannelName
} from '$lib/types/layout/mapping';

/**
 * A field key or accessor function. Mirrors the shorthand used across plots
 * so chart-level encodings (`x`, `y`, `color`, facet, timeline) feel
 * consistent with the plot-level series definitions.
 */
export type Accessor<TRow extends Record<string, unknown>, V> = keyof TRow | ((d: TRow) => V);

/**
 * A plot series: a name, x/y accessors and the rows it draws. Shared as-is by
 * every mark (line, bar, …) - none of them need anything beyond this shape;
 * visual styling lives separately in `segments`.
 */
export type Series<T extends Record<string, unknown> = Record<string, unknown>> = {
	name: string;
	/** Tells apart series that share a `name`, such as one per facet panel. Defaults to `name`. */
	id?: string;
	/** The facet panel the series belongs to, once the "facet" phase splits it. */
	panel?: string;
	/** Horizontal position. A plot reading one position channel only (a histogram) takes either alone. */
	x?: Accessor<T, AxisValue>;
	/** Vertical position. */
	y?: Accessor<T, AxisValue>;
	/** The `color` channel's own accessor - a pre-built series is already one group, so this is purely the color value (per-name for most plot kinds; per-cell for HeatmapPlot). */
	color?: Accessor<T, unknown>;
	data: T[];
};

/** The channels a pre-built {@link Series} carries itself, so a plot given `series` takes none of them. */
type SeriesChannelName = AxisChannelName | 'color' | 'grouping';

/**
 * Pre-built series. Mutually exclusive with the data props ({@link DualAxisDataProps}...) - takes
 * precedence when both could apply. Any channel a series doesn't carry
 * itself is still a plot-level prop.
 */
export type SeriesProps<T extends Record<string, unknown>> = {
	series: Series<T>[];
	data?: never;
} & { [K in SeriesChannelName]?: never } & Omit<ChannelAccessors<T>, SeriesChannelName>;

/** The channels of `TRequired` as required props. */
type RequiredChannels<T extends Record<string, unknown>, TRequired extends ChannelName> = Required<
	Pick<ChannelAccessors<T>, TRequired>
>;

/**
 * Flat rows to group into series, as an alternative to {@link SeriesProps}, on a plot with no axes (a treemap):
 * every channel but the position ones. `TRequired` names the channels the plot cannot draw without. The base of
 * {@link SingleAxisDataProps} and {@link DualAxisDataProps}.
 */
export type NonAxisDataProps<
	T extends Record<string, unknown>,
	TRequired extends Exclude<ChannelName, AxisChannelName> = never
> = {
	series?: never;
	data: T[];
	x?: never;
	y?: never;
} & Omit<ChannelAccessors<T>, AxisChannelName> &
	RequiredChannels<T, TRequired>;

/** Flat rows on one axis (a histogram): `x`, or `y` alone, besides every other channel. */
export type SingleAxisDataProps<
	T extends Record<string, unknown>,
	TRequired extends Exclude<ChannelName, AxisChannelName> = never
> = Omit<NonAxisDataProps<T, TRequired>, AxisChannelName> &
	((RequiredChannels<T, 'x'> & { y?: never }) | (RequiredChannels<T, 'y'> & { x?: never }));

/** Flat rows on both axes: `x` and `y`, besides every other channel. */
export type DualAxisDataProps<
	T extends Record<string, unknown>,
	TRequired extends Exclude<ChannelName, AxisChannelName> = never
> = Omit<NonAxisDataProps<T, TRequired>, AxisChannelName> & RequiredChannels<T, AxisChannelName>;
