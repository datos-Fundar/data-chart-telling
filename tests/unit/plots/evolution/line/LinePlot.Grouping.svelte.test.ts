import { render } from 'vitest-browser-svelte';
import { describe, expect, test } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { waitForSvg, countLinePaths } from '../../_helpers/svg';

const DATA = ['CABA', 'GBA'].flatMap((region) =>
	['F', 'M'].flatMap((sex) =>
		[2000, 2010, 2020].map((year) => ({ region, sex, year, value: year / 100 + region.length }))
	)
);

describe('LinePlot - grouping by several levels', () => {
	test('a single field splits the rows into one line per value', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			data: DATA,
			x: 'year',
			y: 'value',
			grouping: 'region'
		});
		const svg = await waitForSvg(container);
		expect(countLinePaths(svg)).toBe(2);
	});

	test('a dotted name splits them by the combination of its levels', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			data: DATA,
			x: 'year',
			y: 'value',
			grouping: 'region.sex'
		});
		const svg = await waitForSvg(container);
		expect(countLinePaths(svg)).toBe(4);
	});
});

describe('LinePlot - colors down the levels', () => {
	test('scales.color.depth 2 gives the lines of one region tones of its color', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			data: DATA,
			x: 'year',
			y: 'value',
			grouping: 'region.sex',
			scales: { color: { depth: 2 } }
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => countLinePaths(svg)).toBe(4);
		const strokes = Array.from(svg.querySelectorAll('g.lines path')).map(
			(path) => getComputedStyle(path).stroke
		);
		expect(new Set(strokes).size).toBe(4);
		// Each region's two tones come from its own color: CABA blue-ish, GBA orange-ish.
		const [r1, , b1] = strokes[0].match(/\d+/g)!.map(Number);
		const [r3, , b3] = strokes[2].match(/\d+/g)!.map(Number);
		expect(b1).toBeGreaterThan(r1);
		expect(r3).toBeGreaterThan(b3);
	});
});
