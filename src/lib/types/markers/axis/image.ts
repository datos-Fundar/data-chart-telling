import type { AnyRowContext, PlotRowContext, RowFunction } from '$lib/types/layout/context';
import type { CommonMarkerConfigWithRowOffset } from '$lib/types/markers/channels/commonMarkerConfigWithRowOffset';
import type { CommonMarkerConfigWithRadius } from '$lib/types/markers/channels/commonMarkerConfigWithRadius';

/** An image per row, centered on `x`/`y` (svelteplot's `Image`). */
export type ImageMarkerConfig<TContext extends PlotRowContext = AnyRowContext> =
	CommonMarkerConfigWithRowOffset<
		{
			type: 'image';
			src: string | RowFunction<string, TContext>;
			width?: number | RowFunction<number, TContext>;
			height?: number | RowFunction<number, TContext>;
			title?: string | RowFunction<string, TContext>;
			preserveAspectRatio?: string;
			/** A constant opacity; the shared `opacity` channel is a color ramp, not this. */
			opacity?: number;
		} & Omit<CommonMarkerConfigWithRadius<TContext>, 'opacity'>,
		TContext
	>;
