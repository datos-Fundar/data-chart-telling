import type { AnyRowContext, PlotRowContext, RowFunction } from '$lib/types/layout/context';
import type { CommonMarkerConfigWithOrientation } from '$lib/types/markers/channels/commonMarkerConfigWithOrientation';
import type { StrokeStyle, PerRow } from '$lib/types/plots/styling';
import type { CommonMarkerConfigWithColor } from '$lib/types/markers/channels/commonMarkerConfigWithColor';

/** A short tick per row along one axis (svelteplot's `TickX`/`TickY`). */
export type TickMarkerConfig<TContext extends PlotRowContext = AnyRowContext> = {
	type: 'tick';
	tickLength?: number | RowFunction<number, TContext>;
	styles?: PerRow<StrokeStyle, TContext>;
} & CommonMarkerConfigWithOrientation &
	CommonMarkerConfigWithColor<TContext>;
