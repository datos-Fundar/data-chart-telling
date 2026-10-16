import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import UsePlotProbe from './UsePlotProbe.svelte';
import UsePlotReader from './UsePlotReader.svelte';
import UseFigureReader from './UseFigureReader.svelte';

describe('usePlot / useFigure', () => {
	test('usePlot reads the plot from anything drawn inside it, svelteplot apart', async () => {
		const view = await render(UsePlotProbe);
		const reader = () => view.container.querySelector('[data-testid="plot-reader"]');
		await vi.waitFor(() => expect(reader()).not.toBeNull());
		const el = reader()!;
		expect(el.getAttribute('data-rows')).toBe('2');
		expect(Number(el.getAttribute('data-width'))).toBeGreaterThan(0);
		expect(el.getAttribute('data-strategy')).toBe('x');
		expect(el.getAttribute('data-tooltip')).toBe('false');
		expect(Number(el.getAttribute('data-sp-width'))).toBeGreaterThan(0);
		expect(el.getAttribute('data-legend')).toBe('yes');
	});

	test("useFigure reads the figure's hover and legend from its chrome", async () => {
		const view = await render(UsePlotProbe);
		await vi.waitFor(() =>
			expect(view.container.querySelector('[data-testid="figure-reader"]')).not.toBeNull()
		);
		const el = view.container.querySelector('[data-testid="figure-reader"]')!;
		expect(el.getAttribute('data-strategy')).toBe('x');
		expect(el.getAttribute('data-active-x')).toBe('null');
		expect(el.getAttribute('data-legend')).toBe('yes');
		expect(el.textContent?.trim()).toBe('0');
	});

	test('both fail with a clear message outside a plot or figure', () => {
		expect(() => render(UsePlotReader)).toThrow(/usePlot\(\) must be called inside a plot/);
		expect(() => render(UseFigureReader)).toThrow(/useFigure\(\) must be called inside a figure/);
	});
});
