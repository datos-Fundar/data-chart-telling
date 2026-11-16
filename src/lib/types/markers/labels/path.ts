import type { AnyRowContext, PlotRowContext } from '$lib/types/layout/context';
import type { LabelBaseConfig } from '$lib/types/markers/labels/common';

/** An edge of a shape as it is drawn on the page. */
export type PageEdge = 'top' | 'bottom' | 'left' | 'right';

/** A side of a shape as the plot's middle sees it: the one facing it across, 'inner', or the one facing away, 'outer'. */
export type PlotEdge = 'inner' | 'outer';

/** An edge of a shape that runs along a value: the end away from zero, `'tip'`, or the one at zero, `'base'`. */
export type ValueEdge = 'tip' | 'base';

/** Where a label sits off a closed shape's edge: beyond it, against it within the shape, or centred on it. */
export type ShapeSide = 'outside' | 'inside' | 'on';

/** Where a label sits off an open stroke, as its text reads: above it, below it, or centred on it. */
type StrokeSide = 'above' | 'below' | 'on';

/** A label written along an edge of its shape, read per row: a `'tip'` follows the sign of the row's value. */
export type PathLabelConfig<
	TEdge extends string = PageEdge | PlotEdge | ValueEdge,
	TSide extends string = ShapeSide,
	TContext extends PlotRowContext = AnyRowContext
> = LabelBaseConfig<TContext> & {
	layout: 'path';
	/** `'tip'` on a shape that runs along a value, else `'top'`. */
	edge?: TEdge;
	/** Defaults to `'outside'` on a shape, `'above'` on a stroke. */
	side?: TSide;
	/**
	 * Where along the edge, from its left or top end. On a line or an area, `'max'` and `'min'` are the point of each
	 * one with its highest or lowest value - its peak, its trough. Defaults to `'middle'`.
	 */
	offset?: 'start' | 'middle' | 'end' | 'max' | 'min' | `${number}%`;
	/** Defaults to the configuration's `text.label.gap`. */
	gap?: number;
};

/** A label written along each line a marker draws, curving with it. */
export type StrokeLabelConfig<TContext extends PlotRowContext = AnyRowContext> = Omit<
	PathLabelConfig<never, StrokeSide, TContext>,
	'edge'
>;

/** A label written along the top (`y2`) or bottom (`y1`) edge of each area, curving with it. */
export type AreaEdgeLabelConfig<TContext extends PlotRowContext = AnyRowContext> = PathLabelConfig<
	'top' | 'bottom',
	StrokeSide,
	TContext
>;

/** A label written along the rim of each dot, from its left over its top. */
export type RimLabelConfig<TContext extends PlotRowContext = AnyRowContext> = Omit<
	PathLabelConfig<never, ShapeSide, TContext>,
	'edge'
>;

/**
 * Where a kind writes `'path'` labels: `'box'` along the edges of each row's box, `'stroke'` along each line it
 * draws, `'area'` along the top or bottom edge of each area, `'rim'` around each dot.
 */
export type PathShape = 'box' | 'stroke' | 'area' | 'rim';

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
