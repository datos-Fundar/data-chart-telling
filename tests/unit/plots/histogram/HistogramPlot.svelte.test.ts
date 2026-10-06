import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import HistogramPlot from '$lib/plots/histogram/Plot.svelte';
import { waitForSvg } from '../_helpers/svg';

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
});
