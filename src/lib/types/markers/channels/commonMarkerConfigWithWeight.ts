import type { AnyRowContext, PlotRowContext, RowFunction } from '$lib/types/layout/context';
import type { CommonMarkerConfig } from './commonMarkerConfig';

/** Common props plus the per-row weight channel used by density estimates. */
export type CommonMarkerConfigWithWeight<TContext extends PlotRowContext = AnyRowContext> =
	CommonMarkerConfig<TContext> & {
		weight?: string | RowFunction<number, TContext>;
	};
