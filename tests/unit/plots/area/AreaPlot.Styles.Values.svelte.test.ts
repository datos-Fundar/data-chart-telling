import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import AreaPlot from '$lib/plots/area/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { waitForSvg, countTextLabels } from '../_helpers/svg';

const rows = [
	{ x: 1, y: 2, g: 'A' },
	{ x: 2, y: 4, g: 'A' },
	{ x: 3, y: 3, g: 'A' },
	{ x: 1, y: 1, g: 'B' },
	{ x: 2, y: 3, g: 'B' },
	{ x: 3, y: 2, g: 'B' }
];

const PLOT = { width: 400, height: 300, data: rows, x: 'x', y: 'y', color: 'g' };

const labels = (svg: Element) =>
	Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);

describe('AreaPlot - styles.values', () => {
	test('no value label by default', async () => {
		const { container } = await render(AreaPlot, PLOT);
		const svg = await waitForSvg(container);
		expect(countTextLabels(svg)).toBe(0);
	});

	test('values.show labels each series once, with its last value', async () => {
		const { container } = await render(AreaPlot, {
			...PLOT,
			styles: { values: { show: true } } satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		expect(labels(svg).sort()).toEqual(['A - 3', 'B - 2']);
	});

	test('a stacked area is labelled with its own value, not the running total', async () => {
		const { container } = await render(AreaPlot, {
			...PLOT,
			transforms: [{ type: 'stackY' }],
			styles: { values: { show: true } } satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		expect(labels(svg).sort()).toEqual(['A - 3', 'B - 2']);
	});

	test('the labels draw on top of the areas', async () => {
		const { container } = await render(AreaPlot, {
			...PLOT,
			transforms: [{ type: 'stackY' }],
			styles: { values: { show: true } } satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		const lastArea = Array.from(svg.querySelectorAll('path.area')).at(-1)!;
		const label = svg.querySelector('g.text text')!;
		expect(lastArea.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
	});

	test('hoverIsolate: hovering one label dims the other series', async () => {
		const { container } = await render(AreaPlot, {
			...PLOT,
			styles: { values: { show: true, hoverIsolate: true } } satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		const groups = Array.from(svg.querySelectorAll('g[role="presentation"]'));
		groups
			.find((g) => g.textContent?.includes('A - 3'))!
			.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));

		await vi.waitFor(() => {
			const other = Array.from(svg.querySelectorAll('g.text text')).find((t) =>
				t.textContent?.includes('B - 2')
			);
			expect(other?.getAttribute('style')).toContain('fill-opacity: 0.12');
		});
		const own = Array.from(svg.querySelectorAll('g.text text')).find((t) =>
			t.textContent?.includes('A - 3')
		);
		expect(own?.getAttribute('style')).toContain('fill-opacity: 1');
	});
});
