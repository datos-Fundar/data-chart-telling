import { describe, test, expect } from 'vitest';
import type { AxisScale } from '$lib/types/layout/scales';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import { NumberFormat } from '$lib/utils/NumberFormat';
import { TickNumbers } from '$lib/layout/scales/TickNumbers';

const cfg = {
	axis: { locale: 'es-AR', compactDisplay: 'short' },
	numbers: {}
} as PlotStylesConfig;
const withDecimals = (decimals: number) => ({ ...cfg, numbers: { decimals } });

describe('NumberFormat', () => {
	test('writes in axis.locale, with as many decimals as the number needs by default', () => {
		const write = NumberFormat.of(undefined, cfg);
		expect(write(1234.5)).toBe('1.234,5');
		expect(write(12)).toBe('12');
	});

	test('decimals fixes the count, and wins over the configuration', () => {
		expect(NumberFormat.of({ decimals: 1 }, cfg)(12)).toBe('12,0');
		expect(NumberFormat.of({ decimals: 0 }, withDecimals(2))(12.6)).toBe('13');
		expect(NumberFormat.of({}, withDecimals(2))(12)).toBe('12,00');
	});

	test('a fallback count is used only when nothing else sets one', () => {
		expect(NumberFormat.of({}, cfg, 1)(2)).toBe('2,0');
		expect(NumberFormat.of({ decimals: 3 }, withDecimals(2), 1)(2)).toBe('2,000');
		expect(NumberFormat.of({}, withDecimals(2), 1)(2)).toBe('2,00');
	});

	test('prefix and suffix go around the number as they are', () => {
		expect(NumberFormat.of({ decimals: 1, suffix: ' %' }, cfg)(12.34)).toBe('12,3 %');
		expect(NumberFormat.of({ prefix: 'US$ ' }, cfg)(1500)).toBe('US$ 1.500');
	});

	test("signDisplay: 'always' writes a plus on positives - never on zero; 'never' writes no sign", () => {
		const always = NumberFormat.of({ signDisplay: 'always' }, cfg);
		expect(always(3)).toBe('+3');
		expect(always(0)).toBe('0');
		expect(always(-3)).toBe('-3');
		const never = NumberFormat.of({ signDisplay: 'never' }, cfg);
		expect(never(-3)).toBe('3');
		expect(NumberFormat.of({ signDisplay: 'auto' }, cfg)(3)).toBe('3');
	});

	test('maybe is undefined while nothing asks for a format', () => {
		expect(NumberFormat.maybe(undefined, cfg)).toBeUndefined();
		expect(NumberFormat.maybe({}, cfg)).toBeUndefined();
		expect(NumberFormat.maybe({ suffix: '%' }, cfg)?.(5)).toBe('5%');
		expect(NumberFormat.maybe({}, withDecimals(1))?.(5)).toBe('5,0');
		expect(NumberFormat.maybe(NumberFormat.displayOf(true), cfg)).toBeUndefined();
	});
});

describe('TickNumbers', () => {
	const ticks = [0, 5, 10, 15, 20];
	const write = (display: Parameters<typeof TickNumbers.format>[0], tick = 5, all = ticks) =>
		TickNumbers.format(display, withDecimals(3))(tick, all.indexOf(tick), all);

	test('a suffix leaves the ticks as the axis writes them', () => {
		expect(write({ suffix: '%' })).toBe('5%');
		expect(write({ prefix: 'US$ ', suffix: ' M' }, 15)).toBe('US$ 15 M');
	});

	test("the configuration's decimals do not reach the ticks, the scale's own do", () => {
		expect(write({ suffix: '%' })).toBe('5%');
		expect(write({ decimals: 1, suffix: '%' })).toBe('5,0%');
	});

	test('ticks that span orders of magnitude read compact, as the automatic ones do', () => {
		const wide = [0, 1000, 2000, 3000];
		expect(write({ suffix: '' }, 2000, wide)).toBe('2 K');
	});

	test('apply turns the fields into a tickFormat, unless the scale sets one or reads as a percent', () => {
		const out = TickNumbers.apply<AxisScale>({ suffix: '%', grid: true }, cfg);
		expect(out).not.toHaveProperty('suffix');
		expect(out?.grid).toBe(true);
		expect(typeof out?.tickFormat).toBe('function');
		const own = (d: unknown) => String(d);
		expect(TickNumbers.apply<AxisScale>({ suffix: '%', tickFormat: own }, cfg)?.tickFormat).toBe(
			own
		);
		expect(
			TickNumbers.apply<AxisScale>({ suffix: '%', percent: true }, cfg)?.tickFormat
		).toBeUndefined();
		const plain = { grid: true };
		expect(TickNumbers.apply(plain, cfg)).toBe(plain);
	});
});
