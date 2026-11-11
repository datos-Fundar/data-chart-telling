/** A marker drawn by svelteplot's `*X` or `*Y` pair. */
export type CommonMarkerConfigWithOrientation = {
	/** Defaults to the plot's way, else to its own channels' when the plot has none. */
	isHorizontal?: boolean;
};
