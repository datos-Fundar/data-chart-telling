import type { AxisChannelName } from '$lib/types/layout/mapping';

/** How an axis lays out its values: as distinct categories, along time, or along a numeric range. */
export type AxisKind = 'discrete' | 'temporal' | 'continuous';

/** Where an axis' kind came from: the author's `scales.*.type`, its values, or the plot kind needing a discrete axis. */
export type AxisOrigin = 'explicit' | 'inferred' | 'promoted';

/** One active position channel, as the "data" phase reads it. */
export type InferredAxis = { kind: AxisKind; origin: AxisOrigin };

/** Which way a plot's marks run: a horizontal plot measures along `x`. */
export type Orientation = 'vertical' | 'horizontal';

/** The part an axis plays: the categories a plot sorts into, or the values it measures. */
export type AxisRole = 'category' | 'value';

/** An axis by name, or by the part it plays - resolved against a plot's own axes. */
export type AxisRef = AxisChannelName | AxisRole;

/** How many axes a plot kind needs as categories: none (line), one (bar), or both (heatmap). */
export type DiscreteAxesCount = 0 | 1 | 2;
