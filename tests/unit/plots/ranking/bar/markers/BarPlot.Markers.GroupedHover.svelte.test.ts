import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import { waitForSvg } from '../../../_helpers/svg';

const DATA = [
	{ cat: 'A', series: 'first', value: 10 },
	{ cat: 'A', series: 'second', value: 20 }
];

// What the hover draws for a series must sit in that series' own strip of the band, as its bar does.
describe.each([['vertical', false] as const, ['horizontal', true] as const])(
	'BarPlot - grouped hover stays in its series strip (%s)',
	(_label, horizontal) => {
		async function mount() {
			const { container } = await render(BarPlot, {
				width: 400,
				height: 300,
				data: DATA,
				...(horizontal ? { x: 'value', y: 'cat' } : { x: 'cat', y: 'value' }),
				color: 'series',
				tooltip: { sync: false, strategy: 'series' },
				markers: [{ type: 'hover', front: [{ type: 'dot' }] }]
			});
			const svg = await waitForSvg(container);
			const bars = Array.from(svg.querySelectorAll('g.bar-x rect, g.bar-y rect')).map((r) =>
				r.getBoundingClientRect()
			);
			const hits = Array.from(svg.querySelectorAll('rect.dct-hit-area'));
			expect(bars).toHaveLength(2);
			expect(hits).toHaveLength(2);
			return { svg, bars, hits };
		}

		const across = (box: DOMRect) => (horizontal ? [box.top, box.bottom] : [box.left, box.right]);

		test.each([0, 1])('series %i: the band and the dot lie over its own bar', async (i) => {
			const { svg, bars, hits } = await mount();
			hits[i].dispatchEvent(new PointerEvent('pointerenter'));
			hits[i].dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
			const [low, high] = across(bars[i]);

			await vi.waitFor(() => {
				const band = svg.querySelector('g.band rect');
				expect(band).toBeTruthy();
				const [bandLow, bandHigh] = across(band!.getBoundingClientRect());
				// The band covers its bar's strip and not the other series'.
				expect(bandLow).toBeCloseTo(low, 0);
				expect(bandHigh).toBeCloseTo(high, 0);
			});

			await vi.waitFor(() => {
				const dot = svg.querySelector('g.dot path, g.dot circle');
				expect(dot).toBeTruthy();
				const [a, b] = across(dot!.getBoundingClientRect());
				expect((a + b) / 2).toBeGreaterThanOrEqual(low - 1);
				expect((a + b) / 2).toBeLessThanOrEqual(high + 1);
			});
		});
	}
);
