import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import AreaPlot from '$lib/plots/area/Plot.svelte';
import { waitForSvg } from '../_helpers/svg';

const rows = [
	{ x: 1, y: 2, g: 'A' },
	{ x: 2, y: 4, g: 'A' },
	{ x: 3, y: 3, g: 'A' },
	{ x: 1, y: 1, g: 'B' },
	{ x: 2, y: 3, g: 'B' },
	{ x: 3, y: 2, g: 'B' }
];

/** Filled area paths in the rendered plot - svelteplot writes fill into the `style` attribute, so read the computed fill. */
function areaPaths(svg: SVGSVGElement): SVGPathElement[] {
	return Array.from(svg.querySelectorAll('path')).filter((p) => {
		const fill = getComputedStyle(p).fill;
		return fill !== '' && fill !== 'none' && fill !== 'rgba(0, 0, 0, 0)';
	});
}

describe('AreaPlot', () => {
	test('a flat data plot draws one default area for the whole data', async () => {
		const { container } = render(AreaPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'x',
			y: 'y'
		});
		const svg = (await waitForSvg(container)) as unknown as SVGSVGElement;
		expect(areaPaths(svg)).toHaveLength(1);
	});

	test('color splits the rows into one area per group', async () => {
		const { container } = render(AreaPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'x',
			y: 'y',
			color: 'g'
		});
		const svg = (await waitForSvg(container)) as unknown as SVGSVGElement;
		expect(areaPaths(svg)).toHaveLength(2);
	});

	test('a series-based plot draws one area per series', async () => {
		const { container } = render(AreaPlot, {
			width: 400,
			height: 300,
			series: [
				{ name: 'A', data: rows.filter((r) => r.g === 'A'), x: 'x', y: 'y' },
				{ name: 'B', data: rows.filter((r) => r.g === 'B'), x: 'x', y: 'y' }
			]
		});
		const svg = (await waitForSvg(container)) as unknown as SVGSVGElement;
		expect(areaPaths(svg)).toHaveLength(2);
	});

	test('a plot-level stackY stacks series-based areas across series', async () => {
		const A = [1, 2, 3].map((x) => ({ x, y: 2 }));
		const B = [1, 2, 3].map((x) => ({ x, y: 3 }));
		const { container } = render(AreaPlot, {
			width: 400,
			height: 300,
			series: [
				{ name: 'A', data: A, x: 'x', y: 'y' },
				{ name: 'B', data: B, x: 'x', y: 'y' }
			],
			transforms: [{ type: 'stackY' as const }]
		});
		const svg = (await waitForSvg(container)) as unknown as SVGSVGElement;
		const ticks = Array.from(svg.querySelectorAll('g.axis-y text')).map((t) =>
			Number(t.textContent)
		);
		expect(Math.max(...ticks)).toBeGreaterThanOrEqual(5);
	});
});
