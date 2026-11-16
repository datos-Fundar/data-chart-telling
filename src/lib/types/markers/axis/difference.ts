import type { Paint } from '$lib/types/plots/styling';
import type { AnyRowContext, PlotRowContext } from '$lib/types/layout/context';
import type { CommonMarkerConfigWithInterval } from '$lib/types/markers/channels/commonMarkerConfigWithInterval';
import type { CurveName } from '$lib/types/layout/styles/curve';

/**
 * Shaded area between two series, colored by which is on top (svelteplot's `DifferenceY`): `y1` is the comparison,
 * `y2` the metric measured against it.
 */
export type DifferenceMarkerConfig<TContext extends PlotRowContext = AnyRowContext> = {
	type: 'difference';
	/** Where the metric (`y2`) is above the comparison (`y1`). Defaults to the configuration's `difference.positiveFill`. */
	positiveFill?: Paint;
	positiveFillOpacity?: number;
	/** Where the metric (`y2`) is below the comparison (`y1`). Defaults to the configuration's `difference.negativeFill`. */
	negativeFill?: Paint;
	negativeFillOpacity?: number;
	curve?: CurveName;
	tension?: number;
} & CommonMarkerConfigWithInterval<TContext>;
