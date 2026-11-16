import type { AnyRowContext, PlotRowContext, RowFunction } from '$lib/types/layout/context';

/** A pixel offset: one for the whole marker, or one per row. */
export type RowOffset<TContext extends PlotRowContext = AnyRowContext> =
	| number
	| RowFunction<number, TContext>;

/**
 * `TConfig` with `dx` and `dy` that may also be a function of the row, for a
 * marker that draws one element per row (a dot, a label, an image). Every other
 * marker takes the plain numbers of `CommonMarkerConfig`.
 */
export type CommonMarkerConfigWithRowOffset<
	TConfig,
	TContext extends PlotRowContext = AnyRowContext
> = Omit<TConfig, 'dx' | 'dy'> & {
	/** Moves each row this many pixels right: a number, or a function of the row. */
	dx?: RowOffset<TContext>;
	/** Moves each row this many pixels down: a number, or a function of the row. */
	dy?: RowOffset<TContext>;
};
