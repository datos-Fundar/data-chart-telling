import type { AreaStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { CommonMarkerConfigWithWeight } from '$lib/types/markers/channels/commonMarkerConfigWithWeight';

/** Two-dimensional kernel density estimation drawn as contour bands (svelteplot's `Density`). */
export type DensityMarkerConfig = {
	type: 'density';
	/** Gaussian kernel bandwidth in pixels; svelteplot defaults to 20. */
	bandwidth?: number;
	/** Contour level count, or an explicit list of density thresholds. */
	thresholds?: number | number[];
	styles?: AreaStyle;
} & CommonMarkerConfigWithColor &
	CommonMarkerConfigWithWeight;
