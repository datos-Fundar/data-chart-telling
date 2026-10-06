import type { CommonMarkerConfig } from '$lib/types/markers/channels/commonMarkerConfig';
import type { ClipAwareMarkerConfig } from '$lib/types/markers/channels/clipMarkerConfig';

/**
 * A box plot (svelteplot's `BoxX`/`BoxY`). Styled per sub-mark through `bar`,
 * `rule`, `dot`, `tickMedian` and `tickMinMax`, each forwarded to svelteplot.
 */
export type BoxMarkerConfig = {
	type: 'box';
	sort?: 'min' | 'max' | 'median' | 'p25' | 'p75' | '-min' | '-max' | '-median' | '-p25' | '-p75';
	bar?: Record<string, unknown>;
	rule?: Record<string, unknown>;
	dot?: Record<string, unknown>;
	tickMedian?: boolean | Record<string, unknown>;
	tickMinMax?: boolean | Record<string, unknown>;
} & CommonMarkerConfig &
	ClipAwareMarkerConfig;
