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
} & CommonMarkerConfigWithArea &
	CommonMarkerConfigWithColor &
	CommonMarkerConfigWithInterval;
