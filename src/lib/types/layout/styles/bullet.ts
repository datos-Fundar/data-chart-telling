import type { WithValues, BarValueLabel } from '$lib/types/layout/styles/values';
import type { GapsAwarePlotStylesConfig } from '$lib/types/layout/styles/gaps';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';

/** The values of a bullet's row its value labels can write: its bar's, its target, its ranges' bounds. */
export type BulletValuePart = 'value' | 'target' | 'ranges';

/** `BulletPlot`'s `styles`: a bar plot's, with the look of its ranges and its target. Each field falls back to `bullet` in the configuration. */
export type BulletStylesConfig = WithValues<
	GapsAwarePlotStylesConfig<BarSegmentStyle>,
	BarValueLabel,
	BulletValuePart
> & {
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
