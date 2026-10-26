import type { CommonMarkerConfig } from '$lib/types/markers/channels/commonMarkerConfig';

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
	thickness?: number;
	slot?: { index: number; count: number };
	/** With `thickness`, where across its share of the band the box sits: a fraction from -0.5 (its start) to 0.5 (its end). Defaults to 0, the middle. */
	center?: number;
} & CommonMarkerConfig;
