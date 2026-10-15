import type { LegendMark } from '$lib/types/layout/legend';

/** What the rest of the system needs to know about a marker kind, declared once per kind in `MarkerKinds`. */
export type MarkerTraits = {
	/**
	 * Whether the marker is cut off where it leaves the plot's frame (within
	 * `frameClip.tolerance`). Marks that stay inside by construction, or that
	 * are meant to overflow (dots, labels, arrows), don't clip. A marker's own
	 * `clip` prop overrides it.
	 */
	clip: boolean;
	/**
	 * Whether the marker draws the plot's own rows when it sets no `data`: a
	 * line, bar or area over the same data as the plot. Markers that are
	 * placed by their own props (a rule, a brush, a hover layer) don't.
	 */
	drawsRows: boolean;
	/**
	 * The symbol the marker takes in an automatic legend item: a line stroke, a
	 * dot, an area, a bar... A marker without one shows as a plain swatch.
	 */
	legendSymbol?: LegendMark;
};
