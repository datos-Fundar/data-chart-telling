import type { DotStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { CommonMarkerConfigWithRadius } from '$lib/types/markers/channels/commonMarkerConfigWithRadius';
import type { CommonMarkerConfigWithSymbol } from '$lib/types/markers/channels/commonMarkerConfigWithSymbol';
import type { ClipUnawareMarkerConfig } from '$lib/types/markers/channels/clipMarkerConfig';

/** A point mark (svelteplot's `Dot`), usable on any plot kind. */
export type DotMarkerConfig = {
	type: 'dot';
	styles?: DotStyle;
} & CommonMarkerConfigWithRadius &
	CommonMarkerConfigWithColor &
	CommonMarkerConfigWithSymbol &
	ClipUnawareMarkerConfig;
