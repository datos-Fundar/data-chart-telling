import type { DotStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { CommonMarkerConfigWithRadius } from '$lib/types/markers/channels/commonMarkerConfigWithRadius';
import type { CommonMarkerConfigWithRowOffset } from '$lib/types/markers/channels/commonMarkerConfigWithRowOffset';
import type { CommonMarkerConfigWithSymbol } from '$lib/types/markers/channels/commonMarkerConfigWithSymbol';

/** A point mark (svelteplot's `Dot`), usable on any plot kind. */
export type DotMarkerConfig = CommonMarkerConfigWithRowOffset<
	{
		type: 'dot';
		styles?: DotStyle;
		/** On a category `x` axis, moves each row across its band: a field or function giving a fraction of the band, as `jitterX` and `shiftX` write it there. */
		bandOffsetX?: string | ((d: any) => number); // eslint-disable-line @typescript-eslint/no-explicit-any
		/** `bandOffsetX` on a category `y` axis. */
		bandOffsetY?: string | ((d: any) => number); // eslint-disable-line @typescript-eslint/no-explicit-any
		/** The share of each band of the plot's category axis the dots take, when several series sit side by side: its index among `count`. */
		slot?: { index: number; count: number };
	} & CommonMarkerConfigWithRadius &
		CommonMarkerConfigWithColor &
		CommonMarkerConfigWithSymbol
>;
