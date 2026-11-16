import type { AnyRowContext, PlotRowContext } from '$lib/types/layout/context';
import type { RimLabelConfig } from '$lib/types/markers/labels/path';
import type { PointLabelConfig } from '$lib/types/markers/labels/point';
import type { CommonMarkerConfigWithLabel } from '$lib/types/markers/channels/commonMarkerConfigWithLabel';
import type { DotStyle, PerRow } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';
import type { CommonMarkerConfigWithRadius } from '$lib/types/markers/channels/commonMarkerConfigWithRadius';
import type { CommonMarkerConfigWithRowOffset } from '$lib/types/markers/channels/commonMarkerConfigWithRowOffset';
import type { CommonMarkerConfigWithSymbol } from '$lib/types/markers/channels/commonMarkerConfigWithSymbol';

/** A point mark (svelteplot's `Dot`), usable on any plot kind. */
export type DotMarkerConfig<TContext extends PlotRowContext = AnyRowContext> =
	CommonMarkerConfigWithRowOffset<
		{
			type: 'dot';
			styles?: PerRow<DotStyle, TContext>;
		} & CommonMarkerConfigWithRadius<TContext> &
			CommonMarkerConfigWithColor<TContext> &
			CommonMarkerConfigWithSymbol<TContext> &
			CommonMarkerConfigWithLabel<RimLabelConfig<TContext> | PointLabelConfig<TContext>>,
		TContext
	>;
