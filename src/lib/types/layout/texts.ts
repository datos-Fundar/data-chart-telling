/**
 * How a text reads where this package writes one: a value label. Each part is optional; what a place leaves
 * unset is written whole. The text counterpart of {@link NumberDisplay}, which a place that writes numbers
 * and texts takes beside it.
 */
export type TextDisplay = {
	/** The widest a text is written, in px: a longer one is cut short with an ellipsis. Unset, it is written whole. */
	maxWidth?: number;
};
