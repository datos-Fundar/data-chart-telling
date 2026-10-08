import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import {
	FEMALE_LIFE_EXPECTANCY,
	MALE_LIFE_EXPECTANCY
} from '../../../../../stories/plots/line/data';
import { waitForSvg, countDifferencePaths } from '../../_helpers/svg';

const COMPARISON = FEMALE_LIFE_EXPECTANCY.map((d, i) => ({
	year: d.year,
	female: d.value,
	male: MALE_LIFE_EXPECTANCY[i].value
}));

describe('LinePlot - markers.difference', () => {
	test('renders positive and negative shaded bands', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: COMPARISON,
			x: 'year',
			y: 'female',
			markers: [
				{ type: 'difference', x: 'year', y1: 'male', y2: 'female' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.positive.difference').length).toBe(1);
		expect(svg.querySelectorAll('g.negative.difference').length).toBe(1);
		expect(countDifferencePaths(svg)).toBe(2);
	});

	test('positiveFill/negativeFill override the rendered colors', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: COMPARISON,
			x: 'year',
			y: 'female',
			markers: [
				{
					type: 'difference',
					x: 'year',
					y1: 'male',
					y2: 'female',
					positiveFill: '#0ea5e9',
					negativeFill: '#f97316'
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const positivePath = svg.querySelector('g.positive.difference path');
		const negativePath = svg.querySelector('g.negative.difference path');
		expect(positivePath?.getAttribute('style')).toContain('fill: rgb(14, 165, 233)');
		expect(negativePath?.getAttribute('style')).toContain('fill: rgb(249, 115, 22)');
	});

	test('does not crash with an empty markers array', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: COMPARISON,
			x: 'year',
			y: 'female',
			markers: []
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});
