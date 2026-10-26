import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import BoxPlot from '$lib/plots/distribution/box/Plot.svelte';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { waitForSvg, countBoxMarks } from '../../_helpers/svg';

/** Two categories of eleven values each; `b`'s last value lies far past its whiskers. */
const rows = [
	...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((v) => ({ c: 'a', v: 100 + v, g: 'A' })),
	...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 60].map((v) => ({ c: 'b', v: 110 + v, g: 'B' }))
];

/** Each box's own rect: the interquartile bar svelteplot draws inside `g.box-x`/`g.box-y`. */
const boxRects = (svg: SVGElement, orientation: 'x' | 'y' = 'y') =>
	Array.from(svg.querySelectorAll(`g.box-${orientation} rect`)) as SVGRectElement[];

describe('BoxPlot', () => {
	test('a flat data plot draws one box marker, one box per category', async () => {
		const { container } = render(BoxPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'c',
			y: 'v'
		});
		const svg = await waitForSvg(container);
		expect(countBoxMarks(svg)).toBe(1);
		expect(boxRects(svg)).toHaveLength(2);
	});

	test('color splits the rows into one box marker per group, each in its own color', async () => {
		const { container } = render(BoxPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'c',
			y: 'v',
			color: 'g'
		});
		const svg = await waitForSvg(container);
		expect(countBoxMarks(svg)).toBe(2);
		const fills = new Set(boxRects(svg).map((r) => getComputedStyle(r).fill));
		expect(fills.size).toBe(2);
	});

	test('a series-based plot draws one box marker per series', async () => {
		const { container } = render(BoxPlot, {
			width: 400,
			height: 300,
			series: [
				{ name: 'A', data: rows.filter((r) => r.g === 'A'), x: 'c', y: 'v' },
				{ name: 'B', data: rows.filter((r) => r.g === 'B'), x: 'c', y: 'v' }
			]
		});
		const svg = await waitForSvg(container);
		expect(countBoxMarks(svg)).toBe(2);
	});

	test('categories along y lay the boxes out sideways', async () => {
		const { container } = render(BoxPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'v',
			y: 'c'
		});
		const svg = await waitForSvg(container);
		expect(boxRects(svg, 'x')).toHaveLength(2);
		expect(svg.outerHTML).not.toContain('NaN');
	});

	test('a value past the whiskers is drawn as an outlier dot', async () => {
		const { container } = render(BoxPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'c',
			y: 'v'
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.box-y g.dot path')).toHaveLength(1);
	});

	test('boxes take the configured fill opacity unless a segment sets its own', async () => {
		const { container } = render(BoxPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'c',
			y: 'v'
		});
		const svg = await waitForSvg(container);
		const opacity = Number(getComputedStyle(boxRects(svg)[0]).fillOpacity);
		expect(opacity).toBeCloseTo(DEFAULT_CONFIG.box.fillOpacity);

		const styled = render(BoxPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'c',
			y: 'v',
			segments: { default: [{ styles: { fillOpacity: 0.3 } }] }
		});
		const own = await waitForSvg(styled.container);
		expect(Number(getComputedStyle(boxRects(own)[0]).fillOpacity)).toBeCloseTo(0.3);
	});

	test('a segment gathers its category’s rows into one box, whatever order they come in', async () => {
		const interleaved = rows.map((_, i) => rows[i % 2 === 0 ? i / 2 : 11 + (i - 1) / 2]);
		const { container } = render(BoxPlot, {
			width: 400,
			height: 300,
			data: interleaved,
			x: 'c',
			y: 'v',
			segments: { default: [{ areas: [{ x: { from: 'b', to: 'b' } }], styles: { fill: 'red' } }] }
		});
		const svg = await waitForSvg(container);
		expect(countBoxMarks(svg)).toBe(2);
		expect(boxRects(svg)).toHaveLength(2);
	});

	test('the value axis fits the values without reaching for zero', async () => {
		const { container } = render(BoxPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'c',
			y: 'v'
		});
		const svg = await waitForSvg(container);
		const ticks = Array.from(svg.querySelectorAll('g.axis-y text')).map((t) =>
			Number(t.textContent)
		);
		expect(Math.min(...ticks)).toBeGreaterThan(0);
	});
});
