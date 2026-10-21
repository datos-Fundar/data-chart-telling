import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import {
	waitForSvg,
	countRegressionMarks,
	countBollingerMarks,
	countLinePaths
} from '../../plots/_helpers/svg';

const scatterData = Array.from({ length: 20 }, (_, i) => ({
	x: i,
	y: i * 2 + Math.sin(i) * 3,
	group: i % 2 === 0 ? 'A' : 'B'
}));

describe('statistics - plot level (Scatter), pooled scope', () => {
	test('a regression entry with no series scope pools every point into one fitted curve', async () => {
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: scatterData,
			x: 'x',
			y: 'y',
			statistics: [{ type: 'regression' }]
		});
		const svg = await waitForSvg(container);
		expect(countRegressionMarks(svg)).toBe(1);
	});
});

describe('statistics - plot level (Scatter), named series scope', () => {
	test('one derived marker per listed series', async () => {
		const { container } = render(ScatterPlot, {
			width: 400,
			height: 300,
			data: scatterData,
			x: 'x',
			y: 'y',
			color: 'group',
			statistics: [{ type: 'bollinger', series: ['A', 'B'] }]
		});
		const svg = await waitForSvg(container);
		expect(countBollingerMarks(svg)).toBe(2);
	});
});

describe('statistics - plot level (Line), movingAverage', () => {
	test('by default renders one smoothed line per series, in that series’ grouping', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: scatterData,
			x: 'x',
			y: 'y',
			color: 'group',
			statistics: [{ type: 'movingAverage', k: 3 }]
		});
		const svg = await waitForSvg(container);
		// 2 series lines (A, B) + 2 derived moving-average lines (one per series).
		expect(countLinePaths(svg)).toBe(4);
	});

	test('pooled: true renders one smoothed line over every series combined', async () => {
		const { container } = render(LinePlot, {
			width: 400,
			height: 300,
			data: scatterData,
			x: 'x',
			y: 'y',
			color: 'group',
			statistics: [{ type: 'movingAverage', k: 3, pooled: true }]
		});
		const svg = await waitForSvg(container);
		// 2 series lines (A, B) + 1 pooled moving-average line.
		expect(countLinePaths(svg)).toBe(3);
	});
});
