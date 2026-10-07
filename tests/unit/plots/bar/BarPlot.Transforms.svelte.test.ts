import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import type { MarkerTransform } from '$lib/types/transforms';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { waitForSvg, countBarRects, countTextLabels } from '../_helpers/svg';

const ROWS = [
	{ category: 'A', value: 10 },
	{ category: 'B', value: 10 },
	{ category: 'C', value: 30 }
];
const SERIES = [{ name: 'a', x: 'category' as const, y: 'value' as const, data: ROWS }];

const heights = (svg: SVGElement) =>
	Array.from(svg.querySelectorAll('g.bar-y rect')).map((r) => Number(r.getAttribute('height')));

describe('BarPlot – plot-level transforms', () => {
	test('a filter drops the bars it rejects', async () => {
		const transforms: MarkerTransform[] = [
			{ type: 'filter', filter: (d: { value: number }) => d.value > 15 }
		];
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: SERIES,
			transforms
		});
		const svg = await waitForSvg(container);
		expect(countBarRects(svg)).toBe(1);
	});

	test('a value transform reshapes side-by-side bars, not only a stack', async () => {
		const transforms: MarkerTransform[] = [{ type: 'mapY', map: 'cumsum' }];
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: SERIES,
			transforms
		});
		const svg = await waitForSvg(container);
		// Running totals 10, 20, 50: each bar as tall as its own total.
		const [a, b, c] = heights(svg);
		expect(b / a).toBeCloseTo(2, 1);
		expect(c / a).toBeCloseTo(5, 1);
	});

	test('value labels follow the bars the transforms left', async () => {
		const transforms: MarkerTransform[] = [
			{ type: 'filter', filter: (d: { value: number }) => d.value > 15 }
		];
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			series: SERIES,
			transforms,
			styles: { values: { show: true } } satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		expect(countTextLabels(svg)).toBe(1);
		expect(svg.querySelector('g.text text')?.textContent).toBe('30');
	});
});
