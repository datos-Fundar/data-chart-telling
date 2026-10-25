import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import { waitForSvg } from '../../plots/_helpers/svg';

import { COUNTRIES_AT_2007 } from '$datasets';

async function dotWidths(scale: { range: [number, number]; zero?: boolean }): Promise<number[]> {
	const { container } = render(ScatterPlot, {
		width: 400,
		height: 300,
		data: COUNTRIES_AT_2007,
		x: 'gdp',
		y: 'life',
		r: 'population',
		scales: { r: scale }
	});
	const svg = await waitForSvg(container);
	const widths = Array.from(svg.querySelectorAll('g.dot path')).map(
		(p) => (p as SVGGraphicsElement).getBBox().width
	);
	return widths;
}

const maxDotWidth = async (range: [number, number]) => Math.max(...(await dotWidths({ range })));

describe('r channel - plot level (Scatter), scales.r.range', () => {
	test('a wider configured range renders visibly larger dots than a narrow one', async () => {
		const narrow = await maxDotWidth([2, 4]);
		const wide = await maxDotWidth([20, 40]);
		expect(wide).toBeGreaterThan(narrow * 2);
	});

	test('the domain includes 0 unless `zero` is off, which then spreads the sizes', async () => {
		const range: [number, number] = [3, 20];
		const withZero = await dotWidths({ range });
		const without = await dotWidths({ range, zero: false });
		const spread = (widths: number[]) => Math.max(...widths) - Math.min(...widths);
		expect(spread(without)).toBeGreaterThan(spread(withZero));
		expect(Math.min(...without)).toBeCloseTo(6, 0);
	});
});
