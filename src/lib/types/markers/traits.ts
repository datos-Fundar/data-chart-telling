import type { ChannelName } from '$lib/types/layout/mapping';
import type { LegendMark } from '$lib/types/layout/legend';
import type { MarkerLabelTraits } from '$lib/types/markers/labels/common';

/** A plot channel a marker can take from its plot; `x`/`y` are each taken only by a marker setting no position on that axis. */
export type InheritedChannel = Exclude<ChannelName, 'value'>;

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
	/** The plot's channels the marker takes in place of those it leaves unset, with the plot's scales for those that have one. */
	inherits?: InheritedChannel[];
	/** Whether it runs one way or the other (svelteplot's `*X`/`*Y` pair): the plot's way, else its own channels'. */
	oriented?: boolean;
	/** The labels the marker can write over its shapes; none without it. */
	labels?: MarkerLabelTraits;
};
