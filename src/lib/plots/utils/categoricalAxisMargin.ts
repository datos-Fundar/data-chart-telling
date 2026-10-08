import { getConfiguration } from '$lib/configuration/config.svelte';
import { measureMaxLabelWidth } from '$lib/layout/base/measureText';

/**
 * Margin an axis needs to fit the widest of `labels` in the theme's axis font,
 * plus its tick size and padding. Measured off-DOM, so it is exact from the
 * first render. Meant for a facet's `marginsForFacet`.
 */
export function estimateCategoricalAxisMargin(labels: string[]): number {
	const cfg = getConfiguration();
	const axisFont = `${cfg.axis.fontSize}px ${cfg.font === 'inherit' ? 'sans-serif' : cfg.font}`;
	return (
		Math.ceil(measureMaxLabelWidth(labels, axisFont)) + cfg.axis.yTickSize + cfg.axis.yTickPadding
	);
}
