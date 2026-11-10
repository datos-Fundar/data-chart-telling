import type { LabelAnchor } from '$lib/types/plots/constants';
import type { LabelBaseConfig } from '$lib/types/markers/labels/common';

/** An edge of a shape as it is drawn on the page. */
export type PageEdge = 'top' | 'bottom' | 'left' | 'right';

/** An edge of a shape that runs along a value: the end away from zero, `'tip'`, or the one at zero, `'base'`. */
export type ValueEdge = 'tip' | 'base';

/** Where a label sits off a closed shape's edge: beyond it, against it within the shape, or centred on it. */
export type ShapeSide = 'outside' | 'inside' | 'on';

/** Where a label sits off an open stroke, as its text reads: above it, below it, or centred on it. */
export type StrokeSide = 'above' | 'below' | 'on';

/** A label written along an edge of its shape, read per row: a `'tip'` follows the sign of the row's value. */
export type PathLabelConfig<
	TEdge extends string = PageEdge | ValueEdge,
	TSide extends string = ShapeSide
> = LabelBaseConfig & {
	layout: 'path';
	/** `'tip'` on a shape that runs along a value, else `'top'`. */
	edge?: TEdge;
	/** Defaults to `'outside'` on a shape, `'above'` on a stroke. */
	side?: TSide;
	/** Where along the edge, from its left or top end. Defaults to `'middle'`. */
	offset?: 'start' | 'middle' | 'end' | `${number}%`;
	/** Defaults to the configuration's `text.label.gap`. */
	gap?: number;
};

/** A label written along each line a marker draws, curving with it. */
export type StrokeLabelConfig = Omit<PathLabelConfig<never, StrokeSide>, 'edge'>;

/** A label written along the top (`y2`) or bottom (`y1`) edge of each area, curving with it. */
export type AreaEdgeLabelConfig = PathLabelConfig<'top' | 'bottom', StrokeSide>;

/** A label written along the rim of each dot, from its left over its top. */
export type RimLabelConfig = Omit<PathLabelConfig<never, ShapeSide>, 'edge'>;

/**
 * Where a kind writes `'path'` labels: `'box'` along the edges of each row's box, `'stroke'` along each line it
 * draws, `'area'` along the top or bottom edge of each area, `'rim'` around each dot.
 */
export type PathShape = 'box' | 'stroke' | 'area' | 'rim';

/** Where a plot's value label goes on its shape: in its box at an `anchor`, or along one of its edges. */
export type ShapePlacement =
	| { anchor: LabelAnchor }
	| Required<Pick<PathLabelConfig, 'layout' | 'edge' | 'side'>>;

/** One label along a curve, in pixels: the path its text follows and where on it the text sits. */
export type CurvedLabel = {
	d: string;
	text: string;
	/** A row it labels: the row of a dot, the first of a line. */
	row: unknown;
	startOffset: string;
	textAnchor: 'start' | 'middle' | 'end';
	dy: number;
	baseline: 'auto' | 'hanging' | 'central';
	fill?: string;
};
