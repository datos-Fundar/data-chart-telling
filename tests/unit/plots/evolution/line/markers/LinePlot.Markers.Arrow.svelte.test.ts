import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { waitForSvg, countArrowMarks } from '../../../_helpers/svg';

describe('LinePlot - markers.arrow', () => {
	test('renders one arrow from a literal point to another', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: [],
			x: 'x',
			y: 'y',
			scales: { x: { domain: [0, 10] }, y: { domain: [0, 10] } },
			markers: [
				{ type: 'arrow', data: [{}], x1: 2, y1: 2, x2: 8, y2: 7 }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countArrowMarks(svg)).toBe(1);
	});

	test('bend renders without crashing', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: [],
			x: 'x',
			y: 'y',
			scales: { x: { domain: [0, 10] }, y: { domain: [0, 10] } },
			markers: [
				{ type: 'arrow', data: [{}], x1: 1, y1: 8, x2: 9, y2: 8, bend: true }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countArrowMarks(svg)).toBe(1);
	});

	test('data + field-key accessors render one arrow per row', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: [],
			x: 'x',
			y: 'y',
			scales: { x: { domain: [0, 10] }, y: { domain: [0, 10] } },
			markers: [
				{
					type: 'arrow',
					data: [
						{ x1: 1, y1: 1, x2: 3, y2: 3 },
						{ x1: 4, y1: 2, x2: 6, y2: 5 }
					],
					x1: 'x1',
					y1: 'y1',
					x2: 'x2',
					y2: 'y2'
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countArrowMarks(svg)).toBe(2);
	});

	test('a styles override changes the rendered stroke color', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: [],
			x: 'x',
			y: 'y',
			scales: { x: { domain: [0, 10] }, y: { domain: [0, 10] } },
			markers: [
				{
					type: 'arrow',
					data: [{}],
					x1: 2,
					y1: 2,
					x2: 8,
					y2: 7,
					styles: { stroke: '#dc2626' }
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const path = svg.querySelector('g.arrow path');
		expect(path?.getAttribute('style')).toContain('rgb(220, 38, 38)');
	});

	test('does not crash with an empty markers array', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: [],
			x: 'x',
			y: 'y',
			scales: { x: { domain: [0, 10] }, y: { domain: [0, 10] } },
			markers: []
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});
