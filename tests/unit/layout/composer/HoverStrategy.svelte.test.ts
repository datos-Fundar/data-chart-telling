import { render } from 'vitest-browser-svelte';
import { describe, expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import HoverStrategyProbe from './HoverStrategyProbe.svelte';

const rules = (container: Element, axis: 'x' | 'y') =>
	container.querySelectorAll(`g.rule-${axis} line, g.rule-${axis} path`).length;

describe("the plot's own hover follows the strategy in force", () => {
	test('a composer changing its strategy while shown changes the crosshair the hover draws', async () => {
		const { container, rerender } = await render(HoverStrategyProbe, { strategy: 'x' });
		await expect.poll(() => container.querySelector('svg')).toBeTruthy();
		const svg = container.querySelector('svg')!;
		await userEvent.hover(page.elementLocator(svg), { force: true });
		await vi.waitFor(() => {
			expect(rules(container, 'x')).toBe(1);
			expect(rules(container, 'y')).toBe(0);
		});

		await rerender({ strategy: 'punctual' });
		await userEvent.hover(page.elementLocator(svg), { force: true, position: { x: 250, y: 140 } });
		await vi.waitFor(() => {
			expect(rules(container, 'x')).toBe(1);
			expect(rules(container, 'y')).toBe(1);
		});

		await rerender({ strategy: 'series' });
		await userEvent.hover(page.elementLocator(svg), { force: true, position: { x: 260, y: 150 } });
		await vi.waitFor(() => {
			expect(rules(container, 'x')).toBe(0);
			expect(rules(container, 'y')).toBe(0);
		});
		await userEvent.unhover(page.elementLocator(svg));
	});
});
