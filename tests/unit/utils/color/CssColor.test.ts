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
});
