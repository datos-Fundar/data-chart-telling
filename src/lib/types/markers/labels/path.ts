import type { LabelAnchor } from '$lib/types/plots/constants';
import type { LabelBaseConfig } from '$lib/types/markers/labels/common';

/** An edge of a shape as it is drawn on the page. */
export type PageEdge = 'top' | 'bottom' | 'left' | 'right';

/** An edge of a shape that runs along a value: the end away from zero, `'tip'`, or the one at zero, `'base'`. */
export type ValueEdge = 'tip' | 'base';

/** A label written along an edge of its shape, read per row: a `'tip'` follows the sign of the row's value. */
export type PathLabelConfig<TEdge extends string = PageEdge | ValueEdge> = LabelBaseConfig & {
	layout: 'path';
	/** `'tip'` on a shape that runs along a value, else `'top'`. */
	edge?: TEdge;
	/** Beyond the edge, against it within the shape, or centred on it. Defaults to `'outside'`. */
	side?: 'outside' | 'inside' | 'on';
	/** Where along the edge, from its left or top end. Defaults to `'middle'`. */
	offset?: 'start' | 'middle' | 'end' | `${number}%`;
	/** Defaults to the configuration's `text.label.gap`. */
	gap?: number;
};

/** `'box'` writes along the edges of each row's box. */
export type PathShape = 'box';

/** Where a plot's value label goes on its shape: in its box at an `anchor`, or along one of its edges. */
export type ShapePlacement =
	| { anchor: LabelAnchor }
	| Required<Pick<PathLabelConfig, 'layout' | 'edge' | 'side'>>;
