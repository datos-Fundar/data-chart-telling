import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import { waitForSvg } from '../_helpers/svg';

const DATA = [
	{ cat: 'A', series: 'first', value: 10 },
	{ cat: 'A', series: 'second', value: 20 }
];

// Checks the hover dot lands on its own segment, for both orientations.
describe.each([['vertical', false] as const, ['horizontal', true] as const])(
	'BarPlot – grouped dot lands inside its own segment (%s)',
	(_label, horizontal) => {
		test('each series own dot falls within that series own rendered bar, not the other one', async () => {
			const { container } = await render(BarPlot, {
				width: 400,
				height: 300,
				data: DATA,
				x: 'cat',
				y: 'value',
				color: 'series',
				scales: horizontal ? { y: { type: 'categorical' } } : {},
				tooltip: {
					facetId: '',
					sync: false,
					strategy: 'series',
					format: (row: unknown) => (row as { series: string }).series
				},
				markers: [{ type: 'hover' }]
			});
			const svg = await waitForSvg(container);
			const barRects = Array.from(svg.querySelectorAll('g.bar-x rect, g.bar-y rect')).map((r) =>
				r.getBoundingClientRect()
			);
			const hitRects = Array.from(svg.querySelectorAll('rect.dct-hit-area'));
			expect(hitRects).toHaveLength(2);

			for (let i = 0; i < 2; i++) {
				hitRects[i].dispatchEvent(new PointerEvent('pointerenter'));
				hitRects[i].dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
				await vi.waitFor(() => expect(svg.querySelector('g.dot path, g.dot circle')).toBeTruthy());
				const dotBox = svg.querySelector('g.dot path, g.dot circle')!.getBoundingClientRect();
				const dotCenter = horizontal
					? (dotBox.top + dotBox.bottom) / 2
					: (dotBox.left + dotBox.right) / 2;
				const ownBar = barRects[i];
				const ownRange = horizontal ? [ownBar.top, ownBar.bottom] : [ownBar.left, ownBar.right];
				expect(dotCenter).toBeGreaterThanOrEqual(ownRange[0] - 1);
				expect(dotCenter).toBeLessThanOrEqual(ownRange[1] + 1);
			}
		});
	}
);
