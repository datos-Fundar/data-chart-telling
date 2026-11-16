import type { AnyRowContext, PlotRowContext } from '$lib/types/layout/context';
import type { CommonMarkerConfigWithOrientation } from '$lib/types/markers/channels/commonMarkerConfigWithOrientation';
import type { BollingerStatisticOptions } from '$lib/types/layout/statistics';
import type { CommonMarkerConfig } from '$lib/types/markers/channels/commonMarkerConfig';

/** A moving-average band (svelteplot's `BollingerX`/`BollingerY`). */
export type BollingerMarkerConfig<TContext extends PlotRowContext = AnyRowContext> = {
	type: 'bollinger';
} & CommonMarkerConfigWithOrientation &
	BollingerStatisticOptions &
	CommonMarkerConfig<TContext>;
