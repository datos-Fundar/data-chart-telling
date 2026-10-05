import type { StrokeStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfig } from '$lib/types/markers/channels/commonMarkerConfig';

/** A single line-segment stroke. */
export type LineMarkerConfig = {
	type: 'line';
	styles?: StrokeStyle;
} & CommonMarkerConfig;
