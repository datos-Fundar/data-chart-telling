import type { StrokeStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfig } from '$lib/types/markers/channels/commonMarkerConfig';
import type { ClipAwareMarkerConfig } from '$lib/types/markers/channels/clipMarkerConfig';

/** A single line-segment stroke. */
export type LineMarkerConfig = {
	type: 'line';
	styles?: StrokeStyle;
} & CommonMarkerConfig &
	ClipAwareMarkerConfig;
