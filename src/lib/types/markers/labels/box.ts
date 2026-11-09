import type { LabelBaseConfig } from '$lib/types/markers/labels/common';
import type { TextMarkerConfig } from '$lib/types/markers/basic/text';
import type { LabelAnchor } from '$lib/types/plots/constants';

/** A label written in the box of each shape, fitted to it unless `fit` is `false` or it is `outside`. */
export type BoxLabelConfig = LabelBaseConfig & {
	layout?: 'box';
	anchor?: LabelAnchor;
	outside?: boolean;
	/** Defaults to the configuration's `text.label.gap`. */
	gap?: number;
};

export type BoxShape = 'edges' | 'cell' | 'band';

/** A field, a symbol, a function of the row or a literal. */
export type BoxEdge = unknown;

export type BoxChannels = { x1: BoxEdge; x2: BoxEdge; y1: BoxEdge; y2: BoxEdge };

export type BoxScales = Record<
	string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	{ type?: string; fn: any } | undefined
>;

export type BoxSizer = (
	row: unknown,
	scales: BoxScales
) => { width: number; height: number } | undefined;

export type BoxGeometryOf = {
	x: unknown;
	y: unknown;
	box: BoxChannels | BoxSizer;
	size?: BoxSizer;
};

export type BoxLabelMarker = { marker: TextMarkerConfig; box: BoxChannels | BoxSizer };

export type BoxedMarker = {
	type?: string;
	data?: unknown[];
	x?: BoxEdge;
	y?: BoxEdge;
	x1?: BoxEdge;
	x2?: BoxEdge;
	y1?: BoxEdge;
	y2?: BoxEdge;
	isHorizontal?: boolean;
	role?: string;
	thickness?: number;
	styles?: object;
};
