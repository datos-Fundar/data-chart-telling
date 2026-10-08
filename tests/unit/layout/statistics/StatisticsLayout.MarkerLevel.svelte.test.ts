import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { waitForSvg, countBollingerMarks, countRegressionMarks } from '../../plots/_helpers/svg';

const data = Array.from({ length: 20 }, (_, i) => ({ x: i, y: i * 2 + Math.sin(i) * 3 }));

describe('statistics - marker level (Scatter dot)', () => {
	test('a hand-authored dot marker’s own .statistics derives a bollinger band from its own data', async () => {
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: [],
			x: 'x',
			y: 'y',
			markers: [
				{
					type: 'dot',
					data,
					x: 'x',
					y: 'y',
					statistics: [{ type: 'bollinger', n: 5, k: 2 }]
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countBollingerMarks(svg)).toBe(1);
	});

	test('omitting the marker’s own data reuses the host plot’s top-level rows', async () => {
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data,
			x: 'x',
			y: 'y',
			markers: [
				{
					type: 'dot',
					x: 'x',
					y: 'y',
					statistics: [{ type: 'regression' }]
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countRegressionMarks(svg)).toBe(1);
	});

	test('a marker with no x/y set is left alone - no derived marker, no crash', async () => {
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data,
			x: 'x',
			y: 'y',
			markers: [
				{
					type: 'dot',
					statistics: [{ type: 'regression' }]
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countRegressionMarks(svg)).toBe(0);
	});
});
