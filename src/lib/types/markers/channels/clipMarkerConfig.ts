/**
 * A marker that extends over the data (an area, a line, a band of bars), which
 * a pinned domain can push past the plot's frame. `clip: true` clips it to
 * the frame; a plot's own marks of this kind set it.
 */
export type ClipAwareMarkerConfig = {
	/** Whether the marker is clipped to the plot's frame. Defaults to `false`. */
	clip?: boolean;
};

/**
 * A marker that points at one spot or annotates (a dot, a label, a hover
 * highlight), so it's always drawn whole, even on the frame's edge.
 */
export type ClipUnawareMarkerConfig = {
	clip?: never;
};
