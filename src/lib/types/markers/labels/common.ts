import type { TextMarkerConfig } from '$lib/types/markers/basic/text';
import type { BoxLabelConfig, BoxShape } from '$lib/types/markers/labels/box';
import type { PointLabelConfig, PointShape } from '$lib/types/markers/labels/point';
import type { PathLabelConfig, PathShape } from '$lib/types/markers/labels/path';

export type LabelLayout = 'box' | 'path' | 'point';

export type LabelBaseConfig = Omit<
	TextMarkerConfig,
	'type' | 'data' | 'x' | 'y' | 'frameAnchor' | 'origin'
>;

export type MarkerLabelConfig = BoxLabelConfig | PathLabelConfig | PointLabelConfig;

export type MarkerLabels<TLabel extends MarkerLabelConfig = MarkerLabelConfig> = TLabel | TLabel[];

/** The layout a label takes by default, and the geometry the kind gives each layout it supports. */
export type MarkerLabelTraits = {
	default: LabelLayout;
	box?: BoxShape;
	path?: PathShape;
	point?: PointShape;
};
