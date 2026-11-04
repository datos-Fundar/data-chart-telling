import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import { NumberFormat } from '$lib/utils/NumberFormat';
import type { NumberDisplay } from '$lib/types/layout/numbers';

/** Numbers as the plots' axes write them, by `axis.locale` and `axis.compactDisplay`. */
export class AxisNumberFormat {
	/**
	 * A formatter for values across `domain`, as svelteplot's automatic axis
	 * ticks are: compact (`1,2 mil`, `1.2K`) when the domain crosses zero or
	 * spans more than one order of magnitude, plain otherwise.
	 */
	static of(
		domain: [number, number],
		cfg: Pick<PlotStylesConfig, 'axis'>,
		signDisplay?: ReturnType<typeof NumberFormat.sign>
	): (value: number) => string {
		const format = new Intl.NumberFormat(cfg.axis.locale, {
			...(AxisNumberFormat.compact(domain) ? { notation: 'compact' } : {}),
			useGrouping: 'min2',
			compactDisplay: cfg.axis.compactDisplay,
			...(signDisplay ? { signDisplay } : {})
		} as Intl.NumberFormatOptions);
		return (value) => format.format(value);
	}

	/**
	 * How a legend section writes its values: as its `decimals`, `prefix`, `suffix` and `signDisplay` ask, else as the
	 * axes write theirs over `domain` - the configuration's `numbers.decimals` does not reach it. Its own `format`
	 * writes by hand instead: it gets that writer as its second argument, and a number it returns is written by it.
	 */
	static legend(
		section: NumberDisplay & {
			format?: (v: number, number: (v: number) => string) => string | number;
		},
		domain: [number, number],
		cfg: Pick<PlotStylesConfig, 'axis'>
	): (value: number) => string {
		const display = NumberFormat.displayOf(section);
		const { prefix = '', suffix = '' } = display;
		let number: (value: number) => string;
		if (display.decimals !== undefined) {
			number = NumberFormat.of(display, { ...cfg, numbers: {} });
		} else {
			const write = AxisNumberFormat.of(domain, cfg, NumberFormat.sign(display));
			number = (value) => `${prefix}${write(value)}${suffix}`;
		}
		const { format } = section;
		if (!format) return number;
		return (value) => {
			const written = format(value, number);
			return typeof written === 'number' ? number(written) : written;
		};
	}

	/** Whether ticks across `domain` read compact. */
	static compact([min, max]: [number, number]): boolean {
		if (!Number.isFinite(min) || !Number.isFinite(max)) return false;
		if (min <= 0 && max >= 0) return true;
		const magnitude = (d: number) => Math.floor(Math.log10(Math.abs(d)));
		return magnitude(min) !== magnitude(max);
	}
}
