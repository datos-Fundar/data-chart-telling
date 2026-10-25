import type { StrokeStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';

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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	stroke?: string | ((d: any) => string | undefined);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	strokeWidth?: string | ((d: any) => number);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	strokeOpacity?: string | ((d: any) => number);
	styles?: StrokeStyle;
} & CommonMarkerConfigWithInterval;
