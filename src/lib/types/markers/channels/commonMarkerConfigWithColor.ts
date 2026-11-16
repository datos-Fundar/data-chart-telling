import type { AnyRowContext, PlotRowContext, RowFunction } from '$lib/types/layout/context';
import type { CommonMarkerConfig } from './commonMarkerConfig';

/** Common props plus the color ramp channel. */
export type CommonMarkerConfigWithColor<TContext extends PlotRowContext = AnyRowContext> =
	CommonMarkerConfig<TContext> & {
		color?: string | RowFunction<unknown, TContext>;
	};
