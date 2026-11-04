import { AxisNumberFormat } from '$lib/layout/legend/AxisNumberFormat';
import { NumberFormat } from '$lib/utils/NumberFormat';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { NumberDisplay } from '$lib/types/layout/numbers';
import type { AxisScale } from '$lib/types/layout/scales';

type Config = Pick<PlotStylesConfig, 'axis' | 'numbers'>;
type TickFormat = (d: unknown, index: number, ticks: unknown[]) => string;

/** An axis' ticks written as the scale's `decimals`, `prefix`, `suffix` and `signDisplay` ask. */
export class TickNumbers {
	/** Whether `scale` sets any of the display fields. */
	static isSet(scale: NumberDisplay | undefined): boolean {
		return (
			scale?.decimals !== undefined ||
			!!scale?.prefix ||
			!!scale?.suffix ||
			scale?.signDisplay !== undefined
		);
	}

	/**
	 * `scale` with its display fields turned into a `tickFormat`, unless it sets one of its own (which wins) or reads
	 * as a `percent`. The fields are taken out either way.
	 */
	static apply<TScale extends AxisScale<never> | undefined>(scale: TScale, cfg: Config): TScale {
		if (!scale) return scale;
		const { decimals, prefix, suffix, signDisplay, ...rest } = scale;
		const display = { decimals, prefix, suffix, signDisplay };
		if (!TickNumbers.isSet(display)) return scale;
		if (rest.tickFormat !== undefined || rest.percent) return rest as TScale;
		return { ...rest, tickFormat: TickNumbers.format(display, cfg) } as TScale;
	}

	/**
	 * A `tickFormat` for `display`. With `decimals`, every tick has exactly that many; without, ticks read as the
	 * axis writes them on its own (compact when they span orders of magnitude) - the configuration's
	 * `numbers.decimals` does not reach the ticks.
	 */
	static format(display: NumberDisplay, cfg: Config): TickFormat {
		const { prefix = '', suffix = '' } = display;
		const own: Config = { ...cfg, numbers: {} };
		if (display.decimals !== undefined) {
			const fixed = NumberFormat.of(display, own);
			return (d) => (typeof d === 'number' ? fixed(d) : String(d));
		}
		// As svelteplot's automatic format, judged by the ticks' own range, once per set of ticks.
		let ticks: unknown[] | undefined;
		let write: (value: number) => string = String;
		const sign = NumberFormat.sign(display);
		return (d, _index, all) => {
			if (typeof d !== 'number') return String(d);
			if (ticks !== all) {
				const numbers = all.filter((t): t is number => typeof t === 'number' && Number.isFinite(t));
				ticks = all;
				write = AxisNumberFormat.of([Math.min(...numbers), Math.max(...numbers)], cfg, sign);
			}
			return `${prefix}${write(d)}${suffix}`;
		};
	}
}
