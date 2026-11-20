import { LegendText } from '$lib/layout/legend/LegendText';
import { TextFormat } from '$lib/utils/TextFormat';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { LegendSection } from '$lib/types/layout/legend';

/** How a discrete section rewrites the labels its items show: swaps, then a prefix and a suffix. */
export class LegendLabels {
	/**
	 * `sections`, with the labels of every discrete section that sets `labels` rewritten. An item is
	 * rewritten from the text it would show - its `label`, else its name as the legend writes it. The width
	 * `labels` caps them at is the items' own to apply (see `DiscreteSection`).
	 */
	static apply(sections: LegendSection[], cfg: Pick<PlotStylesConfig, 'legend'>): LegendSection[] {
		return sections.map((section) => {
			if (section.type !== 'discrete' || !section.labels) return section;
			const { labels } = section;
			return {
				...section,
				items: section.items.map((item) => ({
					...item,
					label: TextFormat.rewrite(item.label || LegendText.of(item.name, cfg), labels)
				}))
			};
		});
	}
}
