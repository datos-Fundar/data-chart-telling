import type { StrokeStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';
import type { ClipUnawareMarkerConfig } from '$lib/types/markers/channels/clipMarkerConfig';

/** A point-to-point arrow (svelteplot's `Arrow`), from `x1`/`y1` to `x2`/`y2`. */
export type ArrowMarkerConfig = {
	type: 'arrow';
	/** Bend angle in degrees; `true` is shorthand for 22.5. */
	bend?: number | true;
	headAngle?: number;
	headLength?: number;
	inset?: number;
	insetStart?: number;
	insetEnd?: number;
	sweep?: 1 | 0 | -1 | '+x' | '-x' | '+y' | '-y';
	styles?: StrokeStyle;
} & CommonMarkerConfigWithInterval &
	ClipUnawareMarkerConfig;
