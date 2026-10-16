import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { waitForSvg, countWaffleMarks } from '../../_helpers/svg';

const COUNTS = [
	{ region: 'Americas', count: 60 },
	{ region: 'Europe', count: 60 },
	{ region: 'Asia', count: 60 },
	{ region: 'Africa', count: 60 }
];

describe('ScatterPlot - markers.waffle', () => {
	test('a band x with a quantitative y renders one WaffleY cell group per row', async () => {
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: [],
			x: 'region',
			y: 'count',
			scales: { x: { type: 'band' }, y: { domain: [0, 80] } },
			markers: [
				{ type: 'waffle', data: COUNTS, x: 'region', y: 'count' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.waffle-y').length).toBe(COUNTS.length);
		expect(svg.outerHTML).not.toContain('NaN');
	});

	test('a quantitative x with a band y renders via WaffleX', async () => {
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: [],
			x: 'count',
			y: 'region',
			scales: { y: { type: 'band' }, x: { domain: [0, 80] } },
			markers: [
				{ type: 'waffle', data: COUNTS, x: 'count', y: 'region', unit: 5 }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.waffle-x').length).toBe(COUNTS.length);
	});

	test('`color` fills each waffle with its own palette color', async () => {
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: [],
			x: 'region',
			y: 'count',
			scales: { x: { type: 'band' }, y: { domain: [0, 80] } },
			markers: [
				{ type: 'waffle', data: COUNTS, x: 'region', y: 'count', color: 'region' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countWaffleMarks(svg)).toBe(COUNTS.length);
		const fills = new Set(
			[...svg.querySelectorAll('g.waffle-y pattern rect')].map((r) => r.getAttribute('style'))
		);
		expect(fills.size).toBe(COUNTS.length);
	});

	test('cells come out roughly square when a bar spans many units', async () => {
		const { container } = render(ScatterPlot, {
			width: 600,
			height: 400,
			data: [],
			x: 'count',
			y: 'region',
			scales: { y: { type: 'band' }, x: { domain: [0, 160] } },
			markers: [
				{ type: 'waffle', data: [{ region: 'Asia', count: 120 }], x: 'count', y: 'region' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const rect = svg.querySelector('g.waffle-x pattern rect')!;
		const ratio = Number(rect.getAttribute('width')) / Number(rect.getAttribute('height'));
		expect(ratio).toBeGreaterThan(0.7);
		expect(ratio).toBeLessThan(1.4);
	});
});
