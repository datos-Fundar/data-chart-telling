import type { AreaStyle } from '$lib/types/plots/styling';

/**
 * Decorative border around the plot's own content box - svelteplot's
 * `Frame` mark, purely cosmetic (drawn from the box geometry, never from
 * data). `true` enables it with svelteplot's own defaults; an object
 * enables it and overrides its look field-by-field. Insets pull the frame
 * in from the content box's own edges, in pixels.
 */
export type FrameStyle = AreaStyle & {
	inset?: number;
	insetTop?: number;
	insetRight?: number;
	insetBottom?: number;
	insetLeft?: number;
};

/** Author-facing `styles.frame` prop - see {@link FrameStyle}. */
export type FrameProp = boolean | FrameStyle;
