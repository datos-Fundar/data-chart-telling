import { describe, test, expect } from 'vitest';
import { contrastRatio, contrastTextColor, paletteColor } from '$lib/utils/color';

describe('contrastRatio', () => {
	test('black on white is the maximum, 21:1', () => {
		expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 0);
	});

	test('a color against itself is the minimum, 1:1', () => {
		expect(contrastRatio('#4f46e5', '#4f46e5')).toBeCloseTo(1, 5);
	});

	test('is symmetric', () => {
		expect(contrastRatio('#e6580d', '#ffffff')).toBeCloseTo(contrastRatio('#ffffff', '#e6580d'), 5);
	});

	test('falls back to 1 for an unparseable color', () => {
		expect(contrastRatio('not-a-color', '#000000')).toBe(1);
	});
});

describe('contrastTextColor', () => {
	test('picks white text on a dark background', () => {
		expect(contrastTextColor('#111827')).toBe('#ffffff');
	});

	test('picks black text on a light background', () => {
		expect(contrastTextColor('#fde68a')).toBe('#000000');
	});

	test('honors a custom candidate list', () => {
		expect(contrastTextColor('#111827', ['#ff0000', '#00ff00'])).toBe('#00ff00');
	});

	test('falls back to the first candidate when the background cannot be parsed', () => {
		expect(contrastTextColor('not-a-color', ['#123456', '#abcdef'])).toBe('#123456');
	});

	test('every default palette entry resolves to a valid hex candidate', () => {
		const palette = ['#4f46e5', '#e6580d', '#059669', '#dc2626'];
		for (let i = 0; i < palette.length; i++) {
			const color = paletteColor(i, palette);
			expect(['#ffffff', '#000000']).toContain(contrastTextColor(color));
		}
	});
});
