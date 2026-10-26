import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import BoxPlot from '$lib/plots/distribution/box/Plot.svelte';
import { waitForSvg } from '../plots/_helpers/svg';

const rows = Array.from({ length: 30 }, (_, i) => ({
	category: ['a', 'b', 'c'][i % 3],
	value: 10 + ((i * 7) % 23)
}));

const base = { width: 500, height: 300, data: rows, x: 'category', y: 'value' };

/** The horizontal center of every dot the marker draws, once all of them are. */
async function centers(svg: SVGElement) {
	const dots = () => svg.querySelectorAll('g.dot path');
	await expect.poll(() => dots().length).toBe(rows.length);
	return Array.from(dots()).map((d) => {
		const r = d.getBoundingClientRect();
		return Math.round(r.left + r.width / 2);
	});
}

describe('a dot marker on a category axis', () => {
	test('draws every row at the middle of its band', async () => {
		const { container } = render(BoxPlot, {
			...base,
			markers: [{ type: 'dot', data: rows, x: 'category', y: 'value' }]
		});
		const svg = await waitForSvg(container);
		expect(new Set(await centers(svg)).size).toBe(3);
	});

	test('with `jitterX`, spreads its rows across their band', async () => {
		const { container } = render(BoxPlot, {
			...base,
			markers: [
				{
					type: 'dot',
					data: rows,
					x: 'category',
					y: 'value',
					transforms: [{ type: 'jitterX', width: 0.3 }]
				}
			]
		});
		const svg = await waitForSvg(container);
		expect(new Set(await centers(svg)).size).toBeGreaterThan(3);
	});
});
