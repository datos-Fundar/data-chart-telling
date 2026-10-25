import type { GapsAwarePlotStylesConfig } from '$lib/types/layout/styles/gaps';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';

/** `BulletPlot`'s `styles`: a bar plot's, with the look of its ranges and its target. Each field falls back to `bullet` in the configuration. */
export type BulletStylesConfig = GapsAwarePlotStylesConfig<BarSegmentStyle> & {
	/** The bar that shows the value. */
	bar?: {
		/** Its thickness across the category band, in px. */
		thickness?: number;
	};
	/** The bands that grade the value. */
	ranges?: {
		/** Their colors, from the smallest band to the largest; the last one repeats if there are more bands. */
		colors?: string[];
		/** Their thickness, in px. */
		width?: number;
	};
	/** The tick at each target. */
	target?: {
		color?: string;
		/** Its thickness, in px. */
		width?: number;
		/** Its length across the band, in px. */
		length?: number;
	};
};
