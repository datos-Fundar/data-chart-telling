import type { BollingerStatisticOptions } from '$lib/types/layout/statistics';
import type { CommonMarkerConfig } from '$lib/types/markers/channels/commonMarkerConfig';
import type { ClipAwareMarkerConfig } from '$lib/types/markers/channels/clipMarkerConfig';

/** A moving-average band (svelteplot's `BollingerX`/`BollingerY`). */
export type BollingerMarkerConfig = {
	type: 'bollinger';
} & BollingerStatisticOptions &
	CommonMarkerConfig &
	ClipAwareMarkerConfig;
