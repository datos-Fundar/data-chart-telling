import { render } from 'vitest-browser-svelte';
import { describe, expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import HistogramPlot from '$lib/plots/distribution/histogram/Plot.svelte';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { waitForSvg } from '../../_helpers/svg';

const DATA = [1, 2, 2, 3, 3, 3, 4, 4, 5, 6, 7, 8, 8, 9].map((v) => ({ v }));

describe('HistogramPlot - its own hover', () => {
	test("draws the hovered bin's span behind its bar, the whole height of the plot", async () => {
		const { container } = await render(HistogramPlot, {
			width: 400,
			height: 300,
			data: DATA,
			x: 'v',
			markers: [{ type: 'hover' }]
		});
		const svg = await waitForSvg(container);
		const opacity = String(DEFAULT_CONFIG.hover.area.fillOpacity);
		const shaded = () =>
			Array.from(svg.querySelectorAll<SVGRectElement>('rect[style]')).filter(
				(r) => r.style.fillOpacity === opacity
			);
		const bars = () =>
			Array.from(svg.querySelectorAll<SVGRectElement>('rect[style]')).filter(
				(r) => r.style.fillOpacity === '1'
			);
		expect(shaded()).toHaveLength(0);
		await userEvent.hover(page.elementLocator(svg), { force: true });
		await vi.waitFor(() => expect(shaded()).toHaveLength(1));
		const span = shaded()[0].getBoundingClientRect();
		const boxes = bars().map((r) => r.getBoundingClientRect());
		// As tall as the frame, past every bar, and as wide as the one bin it spans.
		expect(span.height).toBeGreaterThanOrEqual(Math.max(...boxes.map((b) => b.height)));
		expect(
			boxes.some((b) => Math.abs(b.left - span.left) < 1 && Math.abs(b.width - span.width) < 1)
		).toBe(true);
		// Behind the bars: drawn before them.
		const first = bars()[0];
		expect(
			shaded()[0].compareDocumentPosition(first) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
		await userEvent.unhover(page.elementLocator(svg));
	});
});
