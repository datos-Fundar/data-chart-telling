import type { AxisValue } from '$lib/types/layout/mapping';

/**
 * Resolved `{data, x, y}` input a statistic computes over - a marker's own
 * data, or one plot series/the pooled combination of every series. `x`/`y`
 * use the same field-key-or-function shape every marker config's own `x`/`y` does.
 */
export type StatisticSource<T extends Record<string, unknown> = Record<string, unknown>> = {
	data: T[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	x: string | ((d: any) => AxisValue);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	y: string | ((d: any) => AxisValue);
	/** Fallback stroke for the derived marker, used when its own `styles.stroke` is unset - typically the source series' own color. */
	color?: string;
};

/**
 * Color a derived statistic draws in when neither its own `styles` nor its
 * source supplies one. A statistic's color is resolved in this order: its own
 * explicit style, then its source's color (the marker's own color, or the
 * plot's default series color - per group when grouped), then this.
 */
export const STATISTIC_FALLBACK_COLOR = '#000000';
