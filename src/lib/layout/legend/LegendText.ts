import { Grouping } from '$lib/utils/grouping';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';

/** How a legend shows the names it reads off the data. */
export class LegendText {
	/** `name` as the legend shows it: as words, unless `legend.pretty` is off. */
	static of(name: string, cfg: Pick<PlotStylesConfig, 'legend'>): string {
		return cfg.legend.pretty ? LegendText.humanize(name) : name;
	}

	/**
	 * A field or category name as words: `_` and camel-case humps split it,
	 * all lowercase but the first letter - `gdp_per_capita` and `gdpPerCapita`
	 * both read "Gdp per capita". All-caps words (acronyms) keep their case. The
	 * levels of a series grouped by several (`'Americas.Argentina'`) are made
	 * words each.
	 */
	static humanize(name: string): string {
		return name.split(Grouping.SEPARATOR).map(LegendText.#words).join(Grouping.SEPARATOR);
	}

	static #words(name: string): string {
		const words = name
			.replace(/_+/g, ' ')
			.replace(/([a-z\d])([A-Z])/g, '$1 $2')
			.trim()
			.split(/\s+/)
			.map((word) => (word === word.toUpperCase() ? word : word.toLowerCase()))
			.join(' ');
		return words.charAt(0).toUpperCase() + words.slice(1);
	}
}
