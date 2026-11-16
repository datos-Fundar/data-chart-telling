import type { AnyRowContext, PlotRowContext, RowFunction } from '$lib/types/layout/context';
import type { CommonMarkerConfigWithArea } from './commonMarkerConfigWithArea';

/** Fill and opacity channels plus the per-row radius `r`. */
export type CommonMarkerConfigWithRadius<TContext extends PlotRowContext = AnyRowContext> =
	CommonMarkerConfigWithArea<TContext> & {
		r?: number | string | RowFunction<number, TContext>;
	};
