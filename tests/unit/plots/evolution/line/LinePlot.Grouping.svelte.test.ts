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
