import type { AxisValue } from '$lib/types/layout/mapping';
import type { AnyRowContext, PlotRowContext, RowFunction } from '$lib/types/layout/context';
import type { CommonMarkerConfig } from './commonMarkerConfig';

/** Common props plus the interval channels `x1`/`x2`/`y1`/`y2`. */
export type CommonMarkerConfigWithInterval<TContext extends PlotRowContext = AnyRowContext> =
	CommonMarkerConfig<TContext> & {
		x1?: string | number | RowFunction<AxisValue, TContext>;
		x2?: string | number | RowFunction<AxisValue, TContext>;
		y1?: string | number | RowFunction<AxisValue, TContext>;
		y2?: string | number | RowFunction<AxisValue, TContext>;
	};
