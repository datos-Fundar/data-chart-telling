import type { TextMarkerConfig } from '$lib/types/markers/basic/text';
import type { BoxLabelConfig, BoxShape } from '$lib/types/markers/labels/box';

export type LabelLayout = 'box';

export type LabelBaseConfig = Omit<TextMarkerConfig, 'type' | 'data' | 'x' | 'y' | 'frameAnchor'>;

export type MarkerLabelConfig = BoxLabelConfig;

export type MarkerLabels<TLabel extends MarkerLabelConfig = MarkerLabelConfig> = TLabel | TLabel[];

/** The layout a label takes by default, and the geometry the kind gives each layout it supports. */
export type MarkerLabelTraits = {
	default: LabelLayout;
	box?: BoxShape;
};
