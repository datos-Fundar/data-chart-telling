import type { RegressionStatisticOptions } from '$lib/types/layout/statistics';
import type { CommonMarkerConfig } from '$lib/types/markers/channels/commonMarkerConfig';

/** A fitted regression curve (svelteplot's `RegressionX`/`RegressionY`). */
export type RegressionMarkerConfig = {
	type: 'regression';
} & RegressionStatisticOptions &
	CommonMarkerConfig;
