import { describe, test, expect, vi } from 'vitest';
import { Palette } from '$lib/utils/color/Palette';

describe('Palette.resolve', () => {
	test('a list of colors is kept as it is', () => {
		expect(Palette.resolve(['#111111', '#222222'])).toEqual(['#111111', '#222222']);
	});

	test('the name of a color list gives that list, in order', () => {
		const dark2 = Palette.resolve('dark2')!;
		expect(dark2[0]).toBe('#1b9e77');
		expect(dark2).toHaveLength(8);
		expect(Palette.resolve('Tableau10')).toHaveLength(10);
	});

	test('a count takes the first colors of a color list', () => {
		expect(Palette.resolve({ scheme: 'dark2', count: 3 })).toEqual([
			'#1b9e77',
			'#d95f02',
			'#7570b3'
		]);
	});

	test('the name of a ramp spreads colors evenly along it, ends included', () => {
		const viridis = Palette.resolve('viridis')!;
		expect(viridis).toHaveLength(Palette.COUNT);
		expect(viridis[0]).toBe(Palette.resolve({ scheme: 'viridis', count: 2 })![0]);
		expect(new Set(viridis).size).toBe(Palette.COUNT);
	});

	test('count and schemeRange pick how many colors and which part of the ramp', () => {
		const full = Palette.resolve({ scheme: 'blues', count: 4 })!;
		const part = Palette.resolve({ scheme: 'blues', count: 4, schemeRange: [0.3, 1] })!;
		expect(part).toHaveLength(4);
		// The near-white start of the ramp is skipped, the dark end is the same.
		expect(part[0]).not.toBe(full[0]);
		expect(part[3]).toBe(full[3]);
	});

	test('a name that is no scheme gives nothing', () => {
		expect(Palette.resolve('not-a-scheme')).toBeUndefined();
	});
});

describe('Palette.resolveIn', () => {
	test('turns the palette of a patch into colors and leaves the rest', () => {
		const patch = Palette.resolveIn({ palette: 'dark2', font: 'serif' });
		expect(patch.palette).toHaveLength(8);
		expect(patch.font).toBe('serif');
	});

	test('a patch with no palette is returned without one', () => {
		expect('palette' in Palette.resolveIn({ font: 'serif' })).toBe(false);
	});

	test('an unknown name warns and leaves the palette out of the patch', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const patch = Palette.resolveIn({ palette: 'not-a-scheme' });
		expect('palette' in patch).toBe(false);
		expect(warn).toHaveBeenCalledOnce();
		warn.mockRestore();
	});
});

describe('Palette.at', () => {
	test('cycles through the palette past its end', () => {
		expect(Palette.at(0, ['#111111', '#222222'])).toBe('#111111');
		expect(Palette.at(3, ['#111111', '#222222'])).toBe('#222222');
	});

	test('an empty palette gives currentColor', () => {
		expect(Palette.at(2, [])).toBe('currentColor');
	});
});
