import type { Accessor, AxisValue } from '$lib/types/layout/mapping';

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
