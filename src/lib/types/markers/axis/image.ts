import type { CommonMarkerConfigWithRowOffset } from '$lib/types/markers/channels/commonMarkerConfigWithRowOffset';
import type { CommonMarkerConfigWithRadius } from '$lib/types/markers/channels/commonMarkerConfigWithRadius';

/** An image per row, centered on `x`/`y` (svelteplot's `Image`). */
export type ImageMarkerConfig = CommonMarkerConfigWithRowOffset<
	{
		type: 'image';
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		src: string | ((d: any) => string);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		width?: number | ((d: any) => number);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		height?: number | ((d: any) => number);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		title?: string | ((d: any) => string);
		preserveAspectRatio?: string;
		/** A constant opacity; the shared `opacity` channel is a color ramp, not this. */
		opacity?: number;
	} & Omit<CommonMarkerConfigWithRadius, 'opacity'>
>;
