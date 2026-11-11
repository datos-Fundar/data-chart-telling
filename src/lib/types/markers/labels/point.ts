import type { LabelBaseConfig } from '$lib/types/markers/labels/common';
import type { ValueSelect } from '$lib/types/layout/styles';
import type { LabelAnchor } from '$lib/types/plots/constants';
import type { BoxScales, BoxSizer } from '$lib/types/markers/labels/box';

/** A label written beside a point of its shape, spread apart from the others with `declutter`. */
export type PointLabelConfig = LabelBaseConfig & {
	layout?: 'point';
	/** The rows labelled, of each `grouping` of the marker. Every row by default. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	select?: ValueSelect | ValueSelect[] | ((row: any) => boolean);
	/** On a shape with a box (a bar, a cell): the point of its box the label starts at, `'middle'` by default. */
	anchor?: LabelAnchor;
	/** Which side of its point the text is written on, as it reads: after it (to its right), before it, above, below or on it. */
	side?: PointSide;
	/** The gap from its point. Defaults to the configuration's `text.label.gap` on a box, else 6px across and 8px up or down. */
	gap?: number;
};

export type PointSide = 'after' | 'before' | 'above' | 'below' | 'on';

/**
 * `'row'` labels each row at its `x`/`y`; `'top'` at its `x`/`y2` (a stacked area); `'box'` at a point of its box;
 * `'dot'` at its center, in a round shape of its radius.
 */
export type PointShape = 'row' | 'top' | 'box' | 'dot';

/** Where a marker's rows are labelled; `size` is the shape around each point, when it has one, `round` a circle in it. */
export type PointGeometryOf = {
	x: unknown;
	y: unknown;
	size?: BoxSizer;
	round?: boolean;
	/** How far each row's point sits off its `x`/`y`, in pixels: a series' own slot of its category's band. */
	shift?: (row: unknown, scales: BoxScales) => { dx: number; dy: number } | undefined;
};

/** The shape a row's point sits in, in pixels around it: a box, or the circle in it. */
export type CoveringShape = { width: number; height: number; round?: boolean };
