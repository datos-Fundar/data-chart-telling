import type { Series } from '$lib/types/plots/data/common';
import type {
	AxisChannelName,
	ChannelAccessors,
	ChannelName,
	SeriesChannelName
} from '$lib/types/layout/mapping';

/**
 * Pre-built series, each carrying its own {@link SeriesChannelName} channels, so a plot given `series` takes
 * none of them. Mutually exclusive with the data props ({@link DualAxisDataProps}...) - takes
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
