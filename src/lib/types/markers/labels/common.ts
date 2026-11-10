import type { TextMarkerConfig } from '$lib/types/markers/basic/text';
import type { BoxLabelConfig, BoxShape } from '$lib/types/markers/labels/box';
import type { PointLabelConfig, PointShape } from '$lib/types/markers/labels/point';

export type LabelLayout = 'box' | 'point';

export type LabelBaseConfig = Omit<
	TextMarkerConfig,
	'type' | 'data' | 'x' | 'y' | 'frameAnchor' | 'origin'
>;

export type MarkerLabelConfig = BoxLabelConfig | PointLabelConfig;

export type MarkerLabels<TLabel extends MarkerLabelConfig = MarkerLabelConfig> = TLabel | TLabel[];

/** The layout a label takes by default, and the geometry the kind gives each layout it supports. */
export type MarkerLabelTraits = {
	default: LabelLayout;
	box?: BoxShape;
	point?: PointShape;
};
