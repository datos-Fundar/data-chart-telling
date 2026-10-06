import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';
import type { MarkerCurveName } from './curveName';
import type { ClipAwareMarkerConfig } from '$lib/types/markers/channels/clipMarkerConfig';

/** Shaded area between two series, colored by which is on top (svelteplot's `DifferenceY`). */
export type DifferenceMarkerConfig = {
	type: 'difference';
	positiveFill?: string;
	positiveFillOpacity?: number;
	negativeFill?: string;
	negativeFillOpacity?: number;
	curve?: MarkerCurveName;
	tension?: number;
} & CommonMarkerConfigWithInterval &
	ClipAwareMarkerConfig;
