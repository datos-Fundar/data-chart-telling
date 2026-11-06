import { describe, test, expect } from 'vitest';
import { CssColor, Palette } from '$lib/utils/color';

describe('CssColor.contrastRatio', () => {
	test('black on white is the maximum, 21:1', () => {
		expect(CssColor.contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 0);
	});

	test('a color against itself is the minimum, 1:1', () => {
		expect(CssColor.contrastRatio('#4f46e5', '#4f46e5')).toBeCloseTo(1, 5);
	});

	test('is symmetric', () => {
		expect(CssColor.contrastRatio('#e6580d', '#ffffff')).toBeCloseTo(
			CssColor.contrastRatio('#ffffff', '#e6580d'),
			5
		);
	});

	test('falls back to 1 for an unparseable color', () => {
		expect(CssColor.contrastRatio('not-a-color', '#000000')).toBe(1);
	});

	test('parses oklch() backgrounds instead of falling back to 1', () => {
		// Regression: the browser's computed-style fallback round-trips oklch()
		// back to oklch() (not rgb()), which used to look like an unparseable
		// color and defaulted to a contrast ratio of 1.
		expect(CssColor.contrastRatio('oklch(70% 0.135 153.45)', '#000000')).toBeGreaterThan(1);
	});
});

describe('CssColor.contrastText', () => {
	test('picks white text on a dark background', () => {
		expect(CssColor.contrastText('#111827')).toBe('#ffffff');
	});

	test('picks black text on a light background', () => {
		expect(CssColor.contrastText('#fde68a')).toBe('#000000');
	});

	test('honors a custom candidate list', () => {
		expect(CssColor.contrastText('#111827', ['#ff0000', '#00ff00'])).toBe('#00ff00');
	});

	test('falls back to the first candidate when the background cannot be parsed', () => {
		expect(CssColor.contrastText('not-a-color', ['#123456', '#abcdef'])).toBe('#123456');
	});

	test('every default palette entry resolves to a valid hex candidate', () => {
		const palette = ['#4f46e5', '#e6580d', '#059669', '#dc2626'];
		for (let i = 0; i < palette.length; i++) {
			const color = Palette.at(i, palette);
			expect(['#ffffff', '#000000']).toContain(CssColor.contrastText(color));
		}
	});

	test('picks black text on the oklch green badge background', () => {
		// Previously fell back to the first candidate (white) because the
		// oklch() background failed to parse; black is the correct WCAG choice
		// (contrast ~8.3:1 vs ~2.5:1 for white).
		expect(CssColor.contrastText('oklch(70% 0.135 153.45)')).toBe('#000000');
	});
	test('falls back to white or black when no candidate reaches WCAG AA', () => {
		// Neither white nor #111827 (both ~4.2:1) reaches 4.5:1 on this green; black does (~4.9:1).
		const green = '#009000';
		expect(CssColor.contrastRatio(green, '#ffffff')).toBeLessThan(CssColor.AA);
		expect(CssColor.contrastText(green, ['#ffffff', '#111827'])).toBe('#000000');
	});

	test('keeps a candidate that reaches the ratio asked for', () => {
		expect(CssColor.contrastText('#f4f1de', ['#ffffff', '#111827'])).toBe('#111827');
		expect(CssColor.contrastText('#009000', ['#ffffff', '#777777'], 3)).toBe('#ffffff');
	});

	test('white or black reaches AA on every opaque color', () => {
		for (let v = 0; v < 256; v += 5) {
			for (const rgb of [
				[v, v, v],
				[v, 0, 0],
				[0, v, 0],
				[0, 0, v],
				[v, v, 0],
				[255, v, v]
			]) {
				const color = `rgb(${rgb.join(', ')})`;
				const text = CssColor.contrastText(color, ['#ffffff', '#111827']);
				expect(CssColor.contrastRatio(color, text)).toBeGreaterThanOrEqual(CssColor.AA);
			}
		}
	});
});

describe('CssColor.alpha', () => {
	test('reads the alpha of rgba(), the slash syntax and 8 digit hex', () => {
		expect(CssColor.alpha('rgba(0, 0, 0, 0.25)')).toBe(0.25);
		expect(CssColor.alpha('rgb(0 0 0 / 40%)')).toBe(0.4);
		expect(CssColor.alpha('#00000080')).toBeCloseTo(0.5, 2);
		expect(CssColor.alpha('transparent')).toBe(0);
		expect(CssColor.alpha('#123456')).toBe(1);
		expect(CssColor.alpha('rgb(1, 2, 3)')).toBe(1);
	});
});

describe('CssColor.composite', () => {
	test('an opaque color is itself', () => {
		expect(CssColor.composite('#1f2a44')).toBe('rgb(31, 42, 68)');
	});

	test('a see-through color blends with its backdrop', () => {
		expect(CssColor.composite('#000000', 0.5, '#ffffff')).toBe('rgb(128, 128, 128)');
		expect(CssColor.composite('rgba(0, 0, 0, 0.5)', 1, '#ffffff')).toBe('rgb(128, 128, 128)');
		expect(CssColor.composite('#ffffff', 0.5, '#000000')).toBe('rgb(128, 128, 128)');
	});

	test('a backdrop that is not opaque counts as white', () => {
		expect(CssColor.composite('#000000', 0.5, 'transparent')).toBe('rgb(128, 128, 128)');
	});
});
