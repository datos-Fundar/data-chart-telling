import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import HistogramPlot from '$lib/plots/distribution/histogram/Plot.svelte';
import { waitForSvg } from '../../_helpers/svg';

const rows = [
	{ v: 1, g: 'A' },
	{ v: 4, g: 'B' },
	{ v: 12, g: 'A' },
	{ v: 15, g: 'A' },
	{ v: 18, g: 'B' }
];

const BIN = [{ type: 'binX' as const, thresholds: [0, 10, 20] }];

/**
 * The bars of the rendered plot: svelteplot draws each bin as a `<rect>`. The
 * plot's own background rects are filled transparent or black, so they're left out.
 */
function bars(svg: SVGSVGElement): SVGRectElement[] {
	return Array.from(svg.querySelectorAll('rect')).filter((r) => {
		const fill = getComputedStyle(r).fill;
		return fill !== 'rgba(0, 0, 0, 0)' && fill !== 'rgb(0, 0, 0)';
	});
}

describe('HistogramPlot - horizontal', () => {
	test('a plot given only `y` bins along y: one horizontal bar per non-empty bin, as long as its count', async () => {
		const { container } = render(HistogramPlot, {
			width: 400,
			height: 300,
			data: rows,
			y: 'v',
			transforms: [{ type: 'binY' as const, thresholds: [0, 10, 20] }]
		});
		const svg = (await waitForSvg(container)) as unknown as SVGSVGElement;
		const drawn = bars(svg).map((r) => r.getBoundingClientRect());
		expect(drawn).toHaveLength(2);
		// Two rows in [0, 10), three in [10, 20): the bins' lengths run along x.
		const widths = drawn.map((r) => r.width).sort((a, b) => a - b);
		expect(widths[1] / widths[0]).toBeCloseTo(3 / 2, 1);
		// Every bar grows from the same zero baseline on the left.
		expect(Math.abs(drawn[0].left - drawn[1].left)).toBeLessThan(1);
	});
});

describe('HistogramPlot', () => {
	test('a flat plot with no grouping draws one bar per non-empty bin', async () => {
		const { container } = render(HistogramPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'v',
			transforms: BIN
		});
		const svg = (await waitForSvg(container)) as unknown as SVGSVGElement;
		expect(bars(svg)).toHaveLength(2);
	});

	test('grouping splits each bin by group, one bar per non-empty bin and group', async () => {
		const { container } = render(HistogramPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'v',
			grouping: 'g',
			transforms: BIN
		});
		const svg = (await waitForSvg(container)) as unknown as SVGSVGElement;
		expect(bars(svg)).toHaveLength(4);
	});

	test('a series-based histogram bins each series on its own', async () => {
		const { container } = render(HistogramPlot, {
			width: 400,
			height: 300,
			series: [
				{ name: 'A', x: 'v', y: 'v', data: rows.filter((r) => r.g === 'A') },
				{ name: 'B', x: 'v', y: 'v', data: rows.filter((r) => r.g === 'B') }
			],
			transforms: BIN
		});
		const svg = (await waitForSvg(container)) as unknown as SVGSVGElement;
		expect(bars(svg)).toHaveLength(4);
	});

	test('the x axis reaches the far edge of the last bin', async () => {
		// An interval of 7 snaps the bins to [0, 21]; the raw values alone only reach 18.
		const { container } = render(HistogramPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'v',
			transforms: [{ type: 'binX' as const, interval: 7 }]
		});
		const svg = (await waitForSvg(container)) as unknown as SVGSVGElement;
		const ticks = Array.from(svg.querySelectorAll('g.axis-x text')).map((t) =>
			Number(t.textContent)
		);
		expect(Math.max(...ticks)).toBeGreaterThanOrEqual(21);
	});
});
