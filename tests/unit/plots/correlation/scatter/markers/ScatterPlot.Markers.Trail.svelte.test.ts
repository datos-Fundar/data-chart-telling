import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { waitForSvg, countTrailPaths } from '../../../_helpers/svg';

const PATH = [
	{ id: 'a', x: 1, y: 1, w: 1 },
	{ id: 'a', x: 2, y: 3, w: 3 },
	{ id: 'a', x: 3, y: 2, w: 5 },
	{ id: 'a', x: 4, y: 4, w: 2 },
	{ id: 'b', x: 1, y: 4, w: 2 },
	{ id: 'b', x: 2, y: 2, w: 4 },
	{ id: 'b', x: 3, y: 3, w: 1 }
];
const base = {
	width: 400,
	height: 300,
	data: [],
	x: 'x',
	y: 'y',
	scales: { x: { domain: [0, 5] }, y: { domain: [0, 5] } }
};

describe('ScatterPlot - markers.trail', () => {
	test('renders a single trail path', async () => {
		const { container } = render(ScatterPlot, {
			...base,
			markers: [
				{ type: 'trail', data: PATH, x: 'x', y: 'y', r: 'w' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countTrailPaths(svg)).toBe(1);
		expect(svg.outerHTML).not.toContain('NaN');
	});

	test('`grouping` draws one trail per group', async () => {
		const { container } = render(ScatterPlot, {
			...base,
			markers: [
				{ type: 'trail', data: PATH, x: 'x', y: 'y', r: 'w', grouping: 'id' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countTrailPaths(svg)).toBe(2);
	});
});
