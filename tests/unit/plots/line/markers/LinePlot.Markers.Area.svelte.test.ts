import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import {
	FEMALE_LIFE_EXPECTANCY,
	MALE_LIFE_EXPECTANCY
} from '../../../../../stories/plots/line/data';
import { waitForSvg, countAreaPaths } from '../../_helpers/svg';

describe('LinePlot - markers.area', () => {
	test('default orientation (AreaY) renders one area path', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: FEMALE_LIFE_EXPECTANCY,
			x: 'year',
			y: 'value',
			markers: [{ type: 'area', x: 'year', y: 'value' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countAreaPaths(svg)).toBe(1);
	});

	test('a quantitative x with a temporal y renders via AreaX', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: FEMALE_LIFE_EXPECTANCY.map((d) => ({ ...d, year: new Date(d.year, 0, 1) })),
			x: 'value',
			y: 'year',
			markers: [
				{ type: 'area', x: 'value', y: 'year' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countAreaPaths(svg)).toBe(1);
	});

	test('explicit y1/y2 draws a band between two series', async () => {
		const band = FEMALE_LIFE_EXPECTANCY.map((d, i) => ({
			year: d.year,
			low: MALE_LIFE_EXPECTANCY[i].value,
			high: d.value
		}));
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: band,
			x: 'year',
			y: 'high',
			markers: [
				{ type: 'area', x: 'year', y1: 'low', y2: 'high' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countAreaPaths(svg)).toBe(1);
	});

	test('a styles override changes the rendered fill color', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: FEMALE_LIFE_EXPECTANCY,
			x: 'year',
			y: 'value',
			markers: [
				{ type: 'area', x: 'year', y: 'value', styles: { fill: '#7c3aed' } }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const path = svg.querySelector('path.area');
		expect(path?.getAttribute('style')).toContain('fill: rgb(124, 58, 237)');
	});

	test('does not crash with an empty markers array', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: FEMALE_LIFE_EXPECTANCY,
			x: 'year',
			y: 'value',
			markers: []
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});
