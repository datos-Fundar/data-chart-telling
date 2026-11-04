import { describe, test, expect } from 'vitest';
import { AxisNumberFormat } from '$lib/layout/legend/AxisNumberFormat';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';

const cfg = { axis: { locale: 'es-AR', compactDisplay: 'short' } } as unknown as Pick<
	PlotStylesConfig,
	'axis'
>;

describe('AxisNumberFormat.legend', () => {
	test('without display fields it writes values as the axes do', () => {
		expect(AxisNumberFormat.legend({}, [30, 70], cfg)(30)).toBe('30');
	});

	test('decimals, prefix and suffix write every value', () => {
		const write = AxisNumberFormat.legend({ decimals: 0, suffix: '%' }, [0, 1], cfg);
		expect(write(40)).toBe('40%');
		expect(AxisNumberFormat.legend({ decimals: 1, suffix: ' %' }, [0, 1], cfg)(0.5)).toBe('0,5 %');
	});

	test('suffix alone keeps the automatic format', () => {
		expect(AxisNumberFormat.legend({ suffix: '%' }, [30, 70], cfg)(30)).toBe('30%');
	});

	test('a number returned by format is written by the display fields', () => {
		const write = AxisNumberFormat.legend(
			{ decimals: 0, suffix: '%', format: (v) => v * 100 },
			[0, 1],
			cfg
		);
		expect(write(0.4)).toBe('40%');
	});

	test('a format gets the writer of the display fields', () => {
		const write = AxisNumberFormat.legend(
			{ decimals: 0, suffix: '%', format: (v, number) => number(v * 100) },
			[0, 1],
			cfg
		);
		expect(write(0.4)).toBe('40%');
	});
});
