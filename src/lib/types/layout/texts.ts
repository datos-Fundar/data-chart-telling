import type { Affix } from '$lib/types/layout/affix';

/**
 * How a text reads where this package writes one: a legend item's label, a category's tick, a value label. Each
 * part is optional; what a place leaves unset is written whole. The text counterpart of {@link NumberDisplay}, which
 * a place that writes numbers and texts takes beside it - and with it the `prefix` and `suffix` they share: there
 * they go around a number, as they always have, and a text that a `format` of the place writes is left as it is.
 */
export type TextDisplay = Affix & {
	/**
	 * What to swap in every text, in order: a text for the text that replaces it (every match), or a list of
	 * `[pattern, replacement]` pairs where the pattern may be a regular expression - `{ Quintile: 'Q' }`,
	 * `[[/^Quartile /, 'Q: ']]`. It goes first, then `prefix` and `suffix` go around the result.
	 */
	replace?: Record<string, string> | [string | RegExp, string][];
	/** The widest a text is written, in px: a longer one is cut short with an ellipsis. Unset, it is written whole. */
	maxWidth?: number;
};
