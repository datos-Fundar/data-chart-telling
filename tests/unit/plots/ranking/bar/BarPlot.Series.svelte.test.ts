import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import { PROVINCE_VALUES, FEMALE_PROVINCE_VALUES, MALE_PROVINCE_VALUES } from '$datasets';
import { waitForSvg, countBarRects } from '../../_helpers/svg';

describe('BarPlot - series prop', () => {
	test('renders an SVG', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [{ name: 'female', x: 'province', y: 'value', data: FEMALE_PROVINCE_VALUES }]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('renders one bar per data point for a single series', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [{ name: 'female', x: 'province', y: 'value', data: FEMALE_PROVINCE_VALUES }]
		});
		const svg = await waitForSvg(container);
		expect(countBarRects(svg)).toBe(FEMALE_PROVINCE_VALUES.length);
	});

	test('renders bars for both series', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: [
				{ name: 'female', x: 'province', y: 'value', data: FEMALE_PROVINCE_VALUES },
				{ name: 'male', x: 'province', y: 'value', data: MALE_PROVINCE_VALUES }
			]
		});
		const svg = await waitForSvg(container);
		expect(countBarRects(svg)).toBe(FEMALE_PROVINCE_VALUES.length + MALE_PROVINCE_VALUES.length);
	});

	test('does not crash with an empty series array', async () => {
		const { container } = await render(BarPlot, { width: 400, height: 300, series: [] });
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});

describe('BarPlot - grouped data (data/x/y/color)', () => {
	test('creates one set of bars per unique color value', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			data: PROVINCE_VALUES,
			x: 'province',
			y: 'value',
			color: 'sex'
		});
		const svg = await waitForSvg(container);
		expect(countBarRects(svg)).toBe(PROVINCE_VALUES.length);
	});
});
