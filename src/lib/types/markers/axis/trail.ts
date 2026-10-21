import type { AreaStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { CommonMarkerConfigWithRadius } from '$lib/types/markers/channels/commonMarkerConfigWithRadius';
import type { CurveName } from '$lib/types/layout/styles/curve';

/** A variable-width ribbon following a path (svelteplot's `Trail`), its width set by `r`. */
export type TrailMarkerConfig = {
	type: 'trail';
	curve?: CurveName;
	tension?: number;
	cap?: 'butt' | 'round';
	resolution?: number | 'auto';
	styles?: Pick<AreaStyle, 'fill' | 'fillOpacity'>;
} & CommonMarkerConfigWithRadius &
	CommonMarkerConfigWithColor;
