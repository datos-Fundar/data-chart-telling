import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import { waitForSvg } from '../../_helpers/svg';

type Row = { cat: string; series: string; value: number };

const DATA: Row[] = [
	{ cat: 'A', series: 'first', value: 10 },
	{ cat: 'A', series: 'second', value: 20 },
	{ cat: 'B', series: 'first', value: 15 },
	{ cat: 'B', series: 'second', value: 5 }
];

function tooltipText(container: Element): string | null {
	return container.querySelector('.dct-tooltip')?.textContent ?? null;
}

// The hit area of each series must cover only its own strip of the category band.
describe.each([['vertical', false] as const, ['horizontal', true] as const])(
	'BarPlot - grouped hit areas follow their series strip (%s)',
	(_label, horizontal) => {
		async function mount() {
			const { container } = await render(BarPlot, {
				width: 400,
				height: 300,
				data: DATA,
				...(horizontal ? { x: 'value', y: 'cat' } : { x: 'cat', y: 'value' }),
				color: 'series',
				tooltip: {
					sync: false,
					strategy: 'series',
					format: (row) => `${(row as Row).series}:${(row as Row).value}`
				}
			});
			const svg = await waitForSvg(container);
			return { container, svg };
		}

		test('no two hit areas overlap', async () => {
			const { svg } = await mount();
			const rects = Array.from(svg.querySelectorAll('rect.dct-hit-area')).map((r) =>
				r.getBoundingClientRect()
			);
			expect(rects).toHaveLength(4);
			// Each spans the value axis, so two overlap only if they share a strip of a band.
			for (let i = 0; i < rects.length; i++) {
				for (let j = i + 1; j < rects.length; j++) {
					const [a, b] = [rects[i], rects[j]];
					const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
					const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
					expect(w > 0.5 && h > 0.5).toBe(false);
				}
			}
		});

		test('hovering over each bar reports its own series', async () => {
			const { container, svg } = await mount();
			const bars = Array.from(svg.querySelectorAll('g.bar-x rect, g.bar-y rect'));
			expect(bars).toHaveLength(4);
			// Bars are drawn series by series, categories in order.
			const expected = ['first', 'first', 'second', 'second'];

			for (const [i, bar] of bars.entries()) {
				const box = bar.getBoundingClientRect();
				const target = document.elementFromPoint(
					box.left + box.width / 2,
					box.top + box.height / 2
				)!;
				expect(target.classList.contains('dct-hit-area')).toBe(true);
				target.dispatchEvent(new PointerEvent('pointerenter'));
				target.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
				await vi.waitFor(() => {
					const text = tooltipText(container) ?? '';
					expect(text).toContain(expected[i]);
					expect(text).not.toContain(expected[i] === 'first' ? 'second' : 'first');
				});
			}
		});
	}
);
