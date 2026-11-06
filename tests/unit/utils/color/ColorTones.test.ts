import { describe, expect, test } from 'vitest';
import { ColorTones } from '$lib/utils/color';
import { CssColor } from '$lib/utils/color/CssColor';

const lightness = (color: string) => {
	const [r, g, b] = CssColor.parse(color)!;
	return r + g + b;
};

describe('ColorTones.of', () => {
	test('a single tone is the color itself, and none is none', () => {
		expect(ColorTones.of('#4e79a7', 1)).toEqual([CssColor.resolve('#4e79a7')]);
		expect(ColorTones.of('#4e79a7', 0)).toEqual([]);
	});

	test('gives as many distinct tones as asked: the color itself first, then lighter ones', () => {
		const tones = ColorTones.of('#4e79a7', 5);
		expect(new Set(tones).size).toBe(5);
		expect(tones[0]).toBe(CssColor.resolve('#4e79a7'));
		const lights = tones.map(lightness);
		expect([...lights].sort((a, b) => a - b)).toEqual(lights);
	});
});

describe('ColorTones.hierarchy', () => {
	const PATHS = [
		['Tertiary', 'Finance', 'Banking'],
		['Secondary', 'Manufacturing', 'Chemicals'],
		['Tertiary', 'Trade', 'Retail'],
		['Tertiary', 'Finance', 'Insurance']
	];
	const BASE: Record<string, string> = { Tertiary: '#e15759', Secondary: '#f28e2c' };
	const colorOf = (value: string) => BASE[value];

	test('depth 1 is the outermost color alone', () => {
		const color = ColorTones.hierarchy(PATHS, 1, colorOf);
		expect(PATHS.map(color)).toEqual(['#e15759', '#f28e2c', '#e15759', '#e15759']);
	});

	test('depth 2 gives each path down to it a tone of its outermost color', () => {
		const color = ColorTones.hierarchy(PATHS, 2, colorOf);
		const [banking, chemicals, retail, insurance] = PATHS.map(color);
		// One kind, one tone: Banking and Insurance are both Finance.
		expect(banking).toBe(insurance);
		expect(banking).not.toBe(retail);
		// A lone kind under its sector keeps the sector's color.
		expect(chemicals).toBe(CssColor.resolve('#f28e2c'));
		expect(ColorTones.of('#e15759', 2)).toEqual([banking, retail]);
	});

	test('the leaves take tones in the order they appear, siblings next to each other', () => {
		const color = ColorTones.hierarchy(PATHS, 3, colorOf);
		const tones = ColorTones.of('#e15759', 3);
		// Banking and Insurance (Finance) come before Retail (Trade), though Retail appears before Insurance.
		expect([color(PATHS[0]), color(PATHS[3]), color(PATHS[2])]).toEqual(tones);
	});
});
