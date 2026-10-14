import type { PlotStylesConfig } from '$lib/types/configuration/styling';

/** Numbers as the plots' axes write them, by `axis.locale` and `axis.compactDisplay`. */
export class AxisNumberFormat {
	/**
	 * A formatter for values across `domain`, as svelteplot's automatic axis
	 * ticks are: compact (`1,2 mil`, `1.2K`) when the domain crosses zero or
	 * spans more than one order of magnitude, plain otherwise.
	 */
	static of(
		domain: [number, number],
		cfg: Pick<PlotStylesConfig, 'axis'>
	): (value: number) => string {
		const format = new Intl.NumberFormat(cfg.axis.locale, {
			...(AxisNumberFormat.compact(domain) ? { notation: 'compact' } : {}),
			useGrouping: 'min2',
			compactDisplay: cfg.axis.compactDisplay
		} as Intl.NumberFormatOptions);
		return (value) => format.format(value);
	}

	/** Whether ticks across `domain` read compact. */
	static compact([min, max]: [number, number]): boolean {
		if (!Number.isFinite(min) || !Number.isFinite(max)) return false;
		if (min <= 0 && max >= 0) return true;
		const magnitude = (d: number) => Math.floor(Math.log10(Math.abs(d)));
		return magnitude(min) !== magnitude(max);
	}
}
