import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import HistogramPlot from '$lib/plots/distribution/histogram/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { waitForSvg, countTextLabels } from '../../_helpers/svg';

const rows = [
	{ v: 1, g: 'A' },
	{ v: 4, g: 'B' },
	{ v: 12, g: 'A' },
	{ v: 15, g: 'A' },
	{ v: 18, g: 'B' }
];

const BIN = [{ type: 'binX' as const, thresholds: [0, 10, 20] }];
const PLOT = { width: 400, height: 300, data: rows, x: 'v', transforms: BIN };

const labels = (svg: Element) =>
	Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);

describe('HistogramPlot - styles.frame', () => {
	test('frame: true draws a border around the content box', async () => {
		const { container } = await render(HistogramPlot, {
			...PLOT,
			styles: { frame: true } satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelector('rect.frame')).toBeTruthy();
	});
});

describe('HistogramPlot - styles.values', () => {
	test('no value label by default', async () => {
		const { container } = await render(HistogramPlot, PLOT);
		const svg = await waitForSvg(container);
		expect(countTextLabels(svg)).toBe(0);
	});

	test('values.show labels each bin with its count', async () => {
		const { container } = await render(HistogramPlot, {
			...PLOT,
			styles: { values: { show: true } } satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		expect(labels(svg)).toEqual(['2', '3']);
	});

	test('an empty bin gets no label', async () => {
		const { container } = await render(HistogramPlot, {
			...PLOT,
			transforms: [{ type: 'binX' as const, thresholds: [0, 10, 20, 30] }],
			styles: { values: { show: true } } satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		expect(labels(svg)).toEqual(['2', '3']);
	});

	test('format receives the count and the series', async () => {
		const { container } = await render(HistogramPlot, {
			...PLOT,
			styles: {
				values: { show: true, format: (count: number) => `n=${count}` }
			} satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		expect(labels(svg)).toEqual(['n=2', 'n=3']);
	});

	test('stacked groups are each labelled with their own count', async () => {
		const { container } = await render(HistogramPlot, {
			...PLOT,
			grouping: 'g',
			transforms: [...BIN, { type: 'stackY' as const }],
			styles: { values: { show: true, anchor: 'middle' } } satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		expect(labels(svg).sort()).toEqual(['1', '1', '1', '2']);
	});

	test('an inside label draws on top of its bar', async () => {
		const { container } = await render(HistogramPlot, {
			...PLOT,
			styles: { values: { show: true, anchor: 'middle' } } satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		const lastBar = Array.from(svg.querySelectorAll('g.rect rect, rect')).at(-1)!;
		const label = svg.querySelector('g.text text')!;
		expect(lastBar.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
	});
});
