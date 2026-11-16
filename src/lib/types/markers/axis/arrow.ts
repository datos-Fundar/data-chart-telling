import type { AnyRowContext, PlotRowContext } from '$lib/types/layout/context';
import type { StrokeStyle, PerRow, DirectedInsetStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';

/** A point-to-point arrow (svelteplot's `Arrow`), from `x1`/`y1` to `x2`/`y2`. */
export type ArrowMarkerConfig<TContext extends PlotRowContext = AnyRowContext> = {
	type: 'arrow';
	/** Bend angle in degrees; `true` is shorthand for 22.5. */
	bend?: number | true;
	headAngle?: number;
	headLength?: number;
	sweep?: 1 | 0 | -1 | '+x' | '-x' | '+y' | '-y';
	styles?: PerRow<StrokeStyle & DirectedInsetStyle, TContext>;
} & CommonMarkerConfigWithInterval<TContext>;
