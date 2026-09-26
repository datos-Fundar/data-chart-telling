import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import { AMERICAS } from '../../../../stories/plots/scatter/data';
import { waitForSvg } from '../../plots/_helpers/svg';

async function maxDotWidth(range: [number, number]): Promise<number> {
	const { container } = render(ScatterPlot, {
		width: 400,
		height: 300,
		data: AMERICAS,
		x: 'gdpPerCapita',
		y: 'lifeExpectancy',
		r: 'population',
		scales: { r: { range } }
	});
	const svg = await waitForSvg(container);
	const widths = Array.from(svg.querySelectorAll('g.dot path')).map(
		(p) => (p as SVGGraphicsElement).getBBox().width
	);
	return Math.max(...widths);
}

describe('r channel – plot level (Scatter), scales.r.range', () => {
	test('a wider configured range renders visibly larger dots than a narrow one', async () => {
		const narrow = await maxDotWidth([2, 4]);
		const wide = await maxDotWidth([20, 40]);
		expect(wide).toBeGreaterThan(narrow * 2);
	});
});
