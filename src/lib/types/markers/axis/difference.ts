import type { AnyRowContext, PlotRowContext } from '$lib/types/layout/context';
import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';
import type { CurveName } from '$lib/types/layout/styles/curve';

/** Shaded area between two series, colored by which is on top (svelteplot's `DifferenceY`). */
export type DifferenceMarkerConfig<TContext extends PlotRowContext = AnyRowContext> = {
	type: 'difference';
	positiveFill?: string;
	positiveFillOpacity?: number;
	negativeFill?: string;
	negativeFillOpacity?: number;
	curve?: CurveName;
	tension?: number;
} & CommonMarkerConfigWithInterval<TContext>;
