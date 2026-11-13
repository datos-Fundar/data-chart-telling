export type Row = Record<string | symbol, unknown>;

/** A transform's props once split: what svelteplot reads as channels, and what it takes as options. */
export type TransformArgs = { channels: Row; options: Row };

/**
 * Everything one transform type needs to run through svelteplot, and the fixes
 * that type alone needs: `prepare` before it runs, `finish` on the marker once
 * every transform has run. A type without a fix leaves the hook out.
 */
export type TransformAdapter = {
	/** The keys svelteplot reads as channels; every other prop of the transform is an option. */
	channelKeys: Record<string, true>;
	/**
	 * Keys that, set on the transform, are reducers (options), while the
	 * marker's own channel of the same name is still read as the reducer's input
	 * - a `groupX`'s `y: 'sum'` sums the marker's `y`.
	 */
	outputKeys?: Record<string, true>;
	/**
	 * The axis whose channels the transform works out row by row, keeping the rows as they are: a marker's further
	 * channels on that axis (a ribbon's `y3`/`y4`) then go through it as `y1`/`y2` do.
	 */
	rowwise?: 'y';
	/** svelteplot's own function for this type, taking channels first and options second. */
	run: (channels: Row, options: Row) => Row;
	/** Fixes the split props before svelteplot sees them. */
	prepare?: (args: TransformArgs) => TransformArgs;
	/** Fixes the marker after all of its transforms have been merged onto it. */
	finish?: (marker: Row) => Row;
};
