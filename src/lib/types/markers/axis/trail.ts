import type { AreaStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { CommonMarkerConfigWithRadius } from '$lib/types/markers/channels/commonMarkerConfigWithRadius';
import type { MarkerCurveName } from './curveName';

/** A variable-width ribbon following a path (svelteplot's `Trail`), its width set by `r`. */
export type TrailMarkerConfig = {
	type: 'trail';
	curve?: MarkerCurveName;
	tension?: number;
	cap?: 'butt' | 'round';
	resolution?: number | 'auto';
	/** A trail is filled only; svelteplot's `Trail` has no stroke. */
	styles?: Pick<AreaStyle, 'fill' | 'fillOpacity'>;
} & CommonMarkerConfigWithRadius &
	CommonMarkerConfigWithColor;
