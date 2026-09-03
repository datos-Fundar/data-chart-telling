import { getConfiguration } from '$lib/configuration/config.svelte';
import { measureMaxLabelWidth } from '$lib/layout/plot/measureText';

/**
 * How much margin an axis needs to fit the widest of `labels` in the
 * theme's own axis font, plus its tick size/padding — any plot's own margin
 * whenever what sits along that axis is plain tick-label text: `BarPlot`'s
 * left margin when its main dimension draws as a category axis, or any
 * plot's numeric axis whose tick-label width can vary a lot (e.g. `"5"` vs
 * `"500,000"`). Off-DOM (canvas) and synchronous, so it's correct from the
 * very first render and stable across a timeline scrubber or dataset
 * change, the same way `estimateValueLabelMargin` is for value labels.
 * Exported for a faceted caller (e.g. `ChartPanel` in the consuming app) to
 * call per facet against that facet's own labels, building a shared
 * `FacetConfig.marginsForFacet`.
 */
export function estimateCategoricalAxisMargin(labels: string[]): number {
	const cfg = getConfiguration();
	const axisFont = `${cfg.axis.fontSize}px ${cfg.font === 'inherit' ? 'sans-serif' : cfg.font}`;
	return (
		Math.ceil(measureMaxLabelWidth(labels, axisFont)) + cfg.axis.yTickSize + cfg.axis.yTickPadding
	);
}
