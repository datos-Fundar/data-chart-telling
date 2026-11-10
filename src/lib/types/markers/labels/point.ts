import type { LabelBaseConfig } from '$lib/types/markers/labels/common';
import type { ValueSelect } from '$lib/types/layout/styles';
import type { LabelAnchor } from '$lib/types/plots/constants';
import type { BoxSizer } from '$lib/types/markers/labels/box';

/** A label written beside a point of its shape, spread apart from the others with `declutter`. */
export type PointLabelConfig = LabelBaseConfig & {
	layout?: 'point';
	/** The rows labelled, of each `grouping` of the marker. Every row by default. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	select?: ValueSelect | ValueSelect[] | ((row: any) => boolean);
	/** On a shape with a box (a bar, a cell): the point of its box the label starts at, `'middle'` by default. */
	anchor?: LabelAnchor;
	/** On a shape with a box: the gap from that point. Defaults to the configuration's `text.label.gap`. */
	gap?: number;
};

/** `'row'` labels each row at its `x`/`y`; `'top'` at its `x`/`y2` (a stacked area); `'box'` at a point of its box. */
export type PointShape = 'row' | 'top' | 'box';

/** Where a marker's rows are labelled; `size` is the box around each point, when it has one. */
export type PointGeometryOf = { x: unknown; y: unknown; size?: BoxSizer };
