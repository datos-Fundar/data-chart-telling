import type { FrameProp } from '$lib/types/layout/styles/frame';
import type { ValuesStyle } from '$lib/types/layout/styles/values';

/**
 * The fields every plot kind's own `styles` shape shares - the common parent
 * of {@link AxisBasedStylesConfig} and {@link GeoStylesConfig}.
 */
export type BasePlotStylesConfig = {
	/** Decorative border around the plot's content box - see {@link FrameStyle}. Available on every plot kind. */
	frame?: FrameProp;
};

/**
 * Top-level rendering style overrides shared by the non-geo plot kinds.
 * Passed as the `styles` prop. Each plot reads only the fields it cares
 * about.
 */
export type AxisBasedStylesConfig = BasePlotStylesConfig & {
	values?: ValuesStyle;
};
