import type { AnyRowContext, PlotRowContext, RowFunction } from '$lib/types/layout/context';
import type { CommonMarkerConfig } from './commonMarkerConfig';

/** Common props plus the opacity channel. */
export type CommonMarkerConfigWithArea<TContext extends PlotRowContext = AnyRowContext> =
	CommonMarkerConfig<TContext> & {
		opacity?: string | RowFunction<unknown, TContext>;
	};
