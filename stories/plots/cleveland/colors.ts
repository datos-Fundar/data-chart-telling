import type { ColorScaleConfig } from '$lib/types/layout/scales';

/** The census years follow one another, so they read best on one hue getting darker: the first year is the lightest, the last the darkest. */
export const SEQUENTIAL_COLORS = {
	scheme: 'blues',
	schemeRange: [0.3, 1]
} satisfies ColorScaleConfig;
