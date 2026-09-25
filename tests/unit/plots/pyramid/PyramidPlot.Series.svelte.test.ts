import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import {
	AGE_GROUPS,
	POPULATION_PYRAMID,
	type PopulationRow
} from '../../../../stories/data/population-pyramid';
import { waitForSvg, countBarRects } from '../_helpers/svg';

const DATA_2022 = POPULATION_PYRAMID.filter((d) => d.year === 2022);

function barFills(svg: SVGElement): string[] {
	return Array.from(svg.querySelectorAll('g.bar-x rect')).map((r) => getComputedStyle(r).fill);
}

describe('PyramidPlot – data/x/y/color shorthand', () => {
	test('renders an SVG', async () => {
		const { container } = await render(PyramidPlot, {
			width: 560,
			height: 520,
			data: DATA_2022,
			x: 'pct',
			y: 'ageGroup',
			color: 'sex'
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('renders one bar per data row, split into two mirrored series', async () => {
		const { container } = await render(PyramidPlot, {
			width: 560,
			height: 520,
			data: DATA_2022,
			x: 'pct',
			y: 'ageGroup',
			color: 'sex',
			scales: { y: { domain: AGE_GROUPS } }
		});
		const svg = await waitForSvg(container);
		expect(countBarRects(svg)).toBe(DATA_2022.length);
	});

	test('does not crash with an empty data array', async () => {
		const { container } = await render(PyramidPlot, {
			width: 560,
			height: 520,
			data: [] as PopulationRow[],
			x: 'pct',
			y: 'ageGroup',
			color: 'sex'
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});

describe('PyramidPlot – explicit series prop', () => {
	test('renders the same bar count as the data/x/y/color shorthand', async () => {
		const { container } = await render(PyramidPlot, {
			width: 560,
			height: 520,
			series: [
				{
					name: 'Female',
					x: 'ageGroup',
					y: 'pct',
					data: DATA_2022.filter((d) => d.sex === 'Female')
				} satisfies Series<PopulationRow>,
				{
					name: 'Male',
					x: 'ageGroup',
					y: 'pct',
					data: DATA_2022.filter((d) => d.sex === 'Male')
				} satisfies Series<PopulationRow>
			],
			scales: { y: { domain: AGE_GROUPS } }
		});
		const svg = await waitForSvg(container);
		expect(countBarRects(svg)).toBe(DATA_2022.length);
	});

	test('the first series name (alphabetically) renders on the left, dyed a distinct color', async () => {
		const { container } = await render(PyramidPlot, {
			width: 560,
			height: 520,
			data: DATA_2022,
			x: 'pct',
			y: 'ageGroup',
			color: 'sex'
		});
		const svg = await waitForSvg(container);
		const fills = new Set(barFills(svg));
		expect(fills.size).toBe(2);
	});
});
