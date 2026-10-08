import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES } from '../../../../../stories/plots/scatter/data';
import { waitForSvg, countTickMarks } from '../../_helpers/svg';

describe('ScatterPlot - markers.tick', () => {
	test('a quantitative x with a band y renders one TickX per row', async () => {
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: [],
			x: 'gdpPerCapita',
			y: 'region',
			scales: { y: { type: 'band' } },
			markers: [
				{ type: 'tick', data: COUNTRIES, x: 'gdpPerCapita', y: 'region' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.tick-x').length).toBe(1);
		expect(countTickMarks(svg)).toBe(COUNTRIES.length);
		expect(svg.outerHTML).not.toContain('NaN');
	});

	test('a band x with a quantitative y renders via TickY', async () => {
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: [],
			x: 'region',
			y: 'gdpPerCapita',
			scales: { x: { type: 'band' } },
			markers: [
				{ type: 'tick', data: COUNTRIES, x: 'region', y: 'gdpPerCapita' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.tick-y').length).toBe(1);
		expect(countTickMarks(svg)).toBe(COUNTRIES.length);
	});

	test('`color` gives ticks different strokes per category', async () => {
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: [],
			x: 'gdpPerCapita',
			y: 'region',
			scales: { y: { type: 'band' } },
			markers: [
				{ type: 'tick', data: COUNTRIES, x: 'gdpPerCapita', y: 'region', color: 'region' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const strokes = new Set(
			[...svg.querySelectorAll('g.tick-x line')].map((l) => l.getAttribute('style') ?? '')
		);
		expect(strokes.size).toBe(new Set(COUNTRIES.map((d) => d.region)).size);
	});
});
