import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import { waitForSvg } from '../_helpers/svg';

type Row = { cat: string; series: string; value: number };

// Both rows share the same category — one segment each, stacked or grouped.
const DATA: Row[] = [
	{ cat: 'A', series: 'female', value: 10 },
	{ cat: 'A', series: 'male', value: 20 }
];

function tooltipText(container: Element): string | null {
	return container.querySelector('.dct-tooltip')?.textContent ?? null;
}

function hitAreaRects(svg: SVGElement): SVGRectElement[] {
	return Array.from(svg.querySelectorAll('rect.dct-hit-area'));
}

describe.each([['stacked'], ['grouped']] as const)(
	'BarPlot – segment hover (%s)',
	(seriesLayout) => {
		test('hovering each segment reports its own series, not a fixed one', async () => {
			const { container } = await render(BarPlot, {
				width: 400,
				height: 300,
				data: DATA,
				x: 'cat',
				y: 'value',
				color: 'series',
				scales: { grouping: { seriesLayout } },
				tooltip: {
					facetId: '',
					sync: false,
					strategy: 'series',
					format: (row) => `${(row as Row).series}:${(row as Row).value}`
				}
			});
			const svg = await waitForSvg(container);
			const rects = hitAreaRects(svg);
			expect(rects).toHaveLength(2);

			// pointerenter drives the match; pointermove is what gates the tooltip visible.
			rects[0].dispatchEvent(new PointerEvent('pointerenter'));
			rects[0].dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
			await vi.waitFor(() => expect(tooltipText(container)).toBeTruthy());
			const firstText = tooltipText(container);

			rects[1].dispatchEvent(new PointerEvent('pointerenter'));
			rects[1].dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
			await vi.waitFor(() => expect(tooltipText(container)).not.toBe(firstText));
			const secondText = tooltipText(container);

			// Each segment reports its own row, never a fixed one.
			expect([firstText, secondText].sort()).toEqual(['female:10', 'male:20']);
		});
	}
);
