/** A pixel offset: one for the whole marker, or one per row. */
export type RowOffset = number | ((d: any) => number); // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * `TConfig` with `dx` and `dy` that may also be a function of the row, for a
 * marker that draws one element per row (a dot, a label, an image). Every other
 * marker takes the plain numbers of `CommonMarkerConfig`.
 */
export type CommonMarkerConfigWithRowOffset<TConfig> = Omit<TConfig, 'dx' | 'dy'> & {
	/** Moves each row this many pixels right: a number, or a function of the row. */
	dx?: RowOffset;
	/** Moves each row this many pixels down: a number, or a function of the row. */
	dy?: RowOffset;
};
