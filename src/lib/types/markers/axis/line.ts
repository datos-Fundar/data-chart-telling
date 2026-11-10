import type { PointLabelConfig } from '$lib/types/markers/labels/point';
import type { CommonMarkerConfigWithLabel } from '$lib/types/markers/channels/commonMarkerConfigWithLabel';
import type { StrokeStyle } from '$lib/types/plots/styling';
import type { CurveName } from '$lib/types/layout/styles/curve';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';

/** A single line-segment stroke; `color` strokes each `grouping`'s line in its own color. */
export type LineMarkerConfig = {
	type: 'line';
	curve?: CurveName;
	styles?: StrokeStyle;
} & CommonMarkerConfigWithColor &
	CommonMarkerConfigWithLabel<PointLabelConfig>;
