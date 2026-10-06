import type { RegressionStatisticOptions } from '$lib/types/layout/statistics';
import type { CommonMarkerConfig } from '$lib/types/markers/channels/commonMarkerConfig';
import type { ClipAwareMarkerConfig } from '$lib/types/markers/channels/clipMarkerConfig';

/** A fitted regression curve (svelteplot's `RegressionX`/`RegressionY`). */
export type RegressionMarkerConfig = {
	type: 'regression';
} & RegressionStatisticOptions &
	CommonMarkerConfig &
	ClipAwareMarkerConfig;
