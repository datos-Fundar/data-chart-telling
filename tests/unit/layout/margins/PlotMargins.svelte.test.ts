import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import PlotMarginsProbe from './PlotMarginsProbe.svelte';
import { Margins } from '$lib/layout/margins/Margins';
import { Box } from '$lib/layout/margins/Box';
import type { PlotMargins } from '$lib/layout/margins/PlotMargins.svelte';

const probe = (container: Element) => container.querySelector('[data-testid="probe"]')!;
const right = (container: Element) => Number(probe(container).getAttribute('data-right'));

describe('PlotMargins - label growth', () => {
	test('a report made while the cap is shrunk does not lower what was measured', async () => {
		// The cap (half the box) is applied when reading, never written into
		// what was measured: a report landing mid-resize, while the box is
		// briefly narrow, must not clamp it for good.
		let margins!: PlotMargins;
		const { container, rerender } = await render(PlotMarginsProbe, {
			width: 1000,
			onReady: (m) => (margins = m)
		});

		margins.reportOverflow(Margins.of({ right: 300 }));
		await vi.waitFor(() => expect(right(container)).toBeGreaterThan(300));
		const grown = right(container);

		await rerender({ width: 40 });
		await vi.waitFor(() => expect(right(container)).toBeLessThan(grown));

		margins.reportOverflow(Margins.of({ right: 300 }));
		await new Promise((r) => setTimeout(r, 0));

		await rerender({ width: 1000 });
		await vi.waitFor(() => expect(right(container)).toBe(grown));
	});

	test('the applied margin never exceeds the current cap', async () => {
		let margins!: PlotMargins;
		const { container, rerender } = await render(PlotMarginsProbe, {
			width: 1000,
			onReady: (m) => (margins = m)
		});
		margins.reportOverflow(Margins.of({ right: 5000 }));
		await vi.waitFor(() => expect(right(container)).toBeLessThan(1000));

		await rerender({ width: 100 });
		await vi.waitFor(() => expect(right(container)).toBeLessThan(150));
	});

	test('never grows a side the author set', async () => {
		let margins!: PlotMargins;
		const { container } = await render(PlotMarginsProbe, {
			width: 1000,
			author: { right: 12 },
			onReady: (m) => (margins = m)
		});
		margins.reportOverflow(Margins.of({ right: 300 }));
		await new Promise((r) => setTimeout(r, 0));
		expect(right(container)).toBe(12);
	});

	test('settled margins read back as author margins hold as a minimum, and can still grow', async () => {
		let margins!: PlotMargins;
		let settled: Record<string, unknown> | undefined;
		const { container, rerender } = await render(PlotMarginsProbe, {
			width: 1000,
			onReady: (m) => (margins = m),
			onSettle: (m) => (settled = m)
		});
		margins.reportOverflow(Margins.of({ right: 100 }));
		await vi.waitFor(() => expect(settled?.right).toBe(Margins.AXIS_ESTIMATE.right + 100));

		await rerender({ author: { ...settled } });
		margins.reportOverflow(Margins.of({ right: 200 }));
		await vi.waitFor(() => expect(right(container)).toBe(Margins.AXIS_ESTIMATE.right + 200));
	});
});

describe('PlotMargins - reserved boxes', () => {
	test('keeps the room a box takes past the edges its point can sit on, and only those', async () => {
		const label = Box.size(40, 12).beside({ x: 6, y: 0 }, { x: 'after', y: 'middle' });
		const { container } = await render(PlotMarginsProbe, {
			width: 1000,
			reserve: [{ box: label, edges: ['right'] }],
			onReady: () => {}
		});
		// The estimate for an `'auto'` side, plus how far the box reaches past the right edge.
		expect(right(container)).toBe(Margins.AXIS_ESTIMATE.right + 46);
		expect(probe(container).getAttribute('data-left')).toBeNull();
	});
});

describe('PlotMargins - rotated tick labels', () => {
	const side = (container: Element, name: string) =>
		Number(probe(container).getAttribute(`data-${name}`));

	test('a rotated x axis takes more room at the bottom, a rotated y axis less on the left', async () => {
		const author = { bottom: 30, left: 40 };
		const { container } = await render(PlotMarginsProbe, {
			width: 1000,
			author,
			scales: { x: { tickRotate: -45 }, y: { tickRotate: -90 } },
			onReady: () => {}
		});
		expect(side(container, 'bottom')).toBeGreaterThan(30);
		expect(side(container, 'left')).toBeLessThan(40);
	});

	test("an 'auto' side is left for svelteplot to fit", async () => {
		const { container } = await render(PlotMarginsProbe, {
			width: 1000,
			author: { bottom: 'auto' },
			scales: { x: { tickRotate: -45 } },
			onReady: () => {}
		});
		expect(probe(container).getAttribute('data-bottom')).toBe('auto');
	});
});
