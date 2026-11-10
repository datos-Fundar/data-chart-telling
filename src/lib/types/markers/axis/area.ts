import type { CommonMarkerConfigWithOrientation } from '$lib/types/markers/channels/commonMarkerConfigWithOrientation';
import type { PointLabelConfig } from '$lib/types/markers/labels/point';
import type { CommonMarkerConfigWithLabel } from '$lib/types/markers/channels/commonMarkerConfigWithLabel';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithArea } from '$lib/types/markers/channels/commonMarkerConfigWithArea';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';
import type { CurveName } from '$lib/types/layout/styles/curve';

/** A filled area under a curve, or a band between two curves (svelteplot's `AreaX`/`AreaY`). */
export type AreaMarkerConfig = {
	type: 'area';
	curve?: CurveName;
	tension?: number;
	styles?: AreaStyle;
} & CommonMarkerConfigWithOrientation &
	CommonMarkerConfigWithArea &
	CommonMarkerConfigWithColor &
	CommonMarkerConfigWithInterval &
	CommonMarkerConfigWithLabel<PointLabelConfig>;
