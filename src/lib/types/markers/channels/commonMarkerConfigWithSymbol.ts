import type { AnyRowContext, PlotRowContext, RowFunction } from '$lib/types/layout/context';
import type { CommonMarkerConfig } from './commonMarkerConfig';

/** Common props plus the categorical shape channel `symbol`. */
export type CommonMarkerConfigWithSymbol<TContext extends PlotRowContext = AnyRowContext> =
	CommonMarkerConfig<TContext> & {
		symbol?: string | RowFunction<unknown, TContext>;
	};
