import { LegendText } from '$lib/layout/legend/LegendText';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { LegendLabels as LegendLabelsConfig, LegendSection } from '$lib/types/layout/legend';

/** How a discrete section rewrites the labels its items show: swaps, then a prefix and a suffix. */
export class LegendLabels {
	/**
	 * `sections`, with the labels of every discrete section that sets `labels` rewritten. An item is
	 * rewritten from the text it would show - its `label`, else its name as the legend writes it.
	 */
	static apply(sections: LegendSection[], cfg: Pick<PlotStylesConfig, 'legend'>): LegendSection[] {
		return sections.map((section) => {
			if (section.type !== 'discrete' || !section.labels) return section;
			const { labels } = section;
			return {
				...section,
				items: section.items.map((item) => ({
					...item,
					label: LegendLabels.rewrite(item.label || LegendText.of(item.name, cfg), labels)
				}))
			};
		});
	}

	/** `text` after `labels`' swaps, in order (each replaces every match), with its prefix and suffix around it. */
	static rewrite(text: string, labels: LegendLabelsConfig): string {
		const swaps = Array.isArray(labels.replace)
			? labels.replace
			: Object.entries(labels.replace ?? {});
		let result = text;
		for (const [pattern, replacement] of swaps)
			result =
				typeof pattern === 'string'
					? result.replaceAll(pattern, () => replacement)
					: result.replace(
							pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`),
							replacement
						);
		return `${labels.prefix ?? ''}${result}${labels.suffix ?? ''}`;
	}
}
