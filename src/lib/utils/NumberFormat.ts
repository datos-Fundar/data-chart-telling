import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { NumberDisplay } from '$lib/types/layout/numbers';

// `'always'` never writes `+0`: Intl's `'exceptZero'`.
const SIGNS = { auto: 'auto', always: 'exceptZero', never: 'never' } as const;

type Config = Pick<PlotStylesConfig, 'axis' | 'numbers'>;

/** Numbers as a {@link NumberDisplay} writes them, in the configuration's `axis.locale`. */
export class NumberFormat {
	/** Whether `display`, or the configuration's `numbers.decimals`, asks for anything: when not, a number is left as the plot writes it by default. */
	static isSet(display: NumberDisplay | undefined, cfg: Config): boolean {
		return (
			(display?.decimals ?? cfg.numbers.decimals) !== undefined ||
			!!display?.prefix ||
			!!display?.suffix ||
			display?.signDisplay !== undefined
		);
	}

	/** `display`'s sign as `Intl.NumberFormat` names it. */
	static sign(display: NumberDisplay | undefined): (typeof SIGNS)[keyof typeof SIGNS] {
		return SIGNS[display?.signDisplay ?? 'auto'];
	}

	/**
	 * A formatter for numbers as `display` asks, over the configuration. `fallbackDecimals` is the count of a
	 * place with a default of its own, used when neither `display` nor the configuration sets one.
	 */
	static of(
		display: NumberDisplay | undefined,
		cfg: Config,
		fallbackDecimals?: number
	): (value: number) => string {
		const decimals = display?.decimals ?? cfg.numbers.decimals ?? fallbackDecimals;
		const format = new Intl.NumberFormat(cfg.axis.locale, {
			...(decimals === undefined
				? {}
				: { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
			signDisplay: NumberFormat.sign(display)
		});
		const { prefix = '', suffix = '' } = display ?? {};
		return (value) => `${prefix}${format.format(value)}${suffix}`;
	}

	/** {@link NumberFormat.of}, or `undefined` while nothing asks for it ({@link NumberFormat.isSet}). */
	static maybe(
		display: NumberDisplay | undefined,
		cfg: Config
	): ((value: number) => string) | undefined {
		return NumberFormat.isSet(display, cfg) ? NumberFormat.of(display, cfg) : undefined;
	}

	/** The fields of `source` that are a {@link NumberDisplay}'s, for a config that carries them beside its own. */
	static displayOf(source: NumberDisplay | boolean | undefined): NumberDisplay {
		const own = typeof source === 'object' ? source : undefined;
		return {
			decimals: own?.decimals,
			prefix: own?.prefix,
			suffix: own?.suffix,
			signDisplay: own?.signDisplay
		};
	}
}
