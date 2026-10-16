import type { AreaStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithArea } from '$lib/types/markers/channels/commonMarkerConfigWithArea';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';
import type { MarkerCurveName } from './curveName';

/** A filled area under a curve, or a band between two curves (svelteplot's `AreaX`/`AreaY`). */
export type AreaMarkerConfig = {
	type: 'area';
	curve?: MarkerCurveName;
	tension?: number;
	styles?: AreaStyle;
} & CommonMarkerConfigWithArea &
	CommonMarkerConfigWithColor &
	CommonMarkerConfigWithInterval;
