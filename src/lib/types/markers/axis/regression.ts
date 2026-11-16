import type { AnyRowContext, PlotRowContext } from '$lib/types/layout/context';
import type { CommonMarkerConfigWithOrientation } from '$lib/types/markers/channels/commonMarkerConfigWithOrientation';
import type { RegressionStatisticOptions } from '$lib/types/layout/statistics';
import type { CommonMarkerConfig } from '$lib/types/markers/channels/commonMarkerConfig';

/** A fitted regression curve (svelteplot's `RegressionX`/`RegressionY`). */
export type RegressionMarkerConfig<TContext extends PlotRowContext = AnyRowContext> = {
	type: 'regression';
} & CommonMarkerConfigWithOrientation &
	RegressionStatisticOptions &
	CommonMarkerConfig<TContext>;
