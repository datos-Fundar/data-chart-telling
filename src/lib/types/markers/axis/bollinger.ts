import type { BollingerStatisticOptions } from '$lib/types/layout/statistics';
import type { CommonMarkerConfig } from '$lib/types/markers/channels/commonMarkerConfig';

/** A moving-average band (svelteplot's `BollingerX`/`BollingerY`). */
export type BollingerMarkerConfig = {
	type: 'bollinger';
} & BollingerStatisticOptions &
	CommonMarkerConfig;
