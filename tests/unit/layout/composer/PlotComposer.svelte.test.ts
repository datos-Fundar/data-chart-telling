import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import ComposerProbe from './ComposerProbe.svelte';
import InsetProbe from './InsetProbe.svelte';

const LEGEND = [
	{
		type: 'discrete' as const,
		interactive: { enabled: true, disabled: { mode: 'dim' as const, style: { opacity: 0.1 } } },
		items: [
			{ name: 'GDP', symbol: 'line' as const },
			{ name: 'Employment', symbol: 'line' as const }
		]
	}
];

async function plots(container: Element, count = 2): Promise<Element[]> {
	await vi.waitFor(() => {
		const found = container.querySelectorAll('.dct-plot');
		expect(found.length).toBe(count);
		for (const plot of found) expect(plot.querySelectorAll('path').length).toBeGreaterThan(0);
	});
	return [...container.querySelectorAll('.dct-plot')];
}

describe('PlotComposer', () => {
	test('renders its own title and one plot per panel', async () => {
		const { container } = await render(ComposerProbe, {});
		await plots(container);
		expect(container.querySelector('.dct-plot-container__title')?.textContent).toBe('Composed');
	});

	test('tags its panels in order', async () => {
		const { container } = await render(ComposerProbe, { tags: 'A' });
		await plots(container);
		const tags = [...container.querySelectorAll('.dct-panel__tag')].map((t) => t.textContent);
		expect(tags).toEqual(['A', 'B']);
	});

	test('layout.areas places panels by name', async () => {
		const { container } = await render(ComposerProbe, {
			layout: { areas: ['south north'] }
		});
		await plots(container);
		const [first] = [...container.querySelectorAll<HTMLElement>('.dct-panel')];
		const rects = [...container.querySelectorAll<HTMLElement>('.dct-panel')].map(
			(p) => p.getBoundingClientRect().left
		);
		expect(first.style.gridArea).toContain('north');
		expect(rects[0]).toBeGreaterThan(rects[1]);
	});

	for (const titled of [false, true]) {
		test(`its legend toggles every panel${titled ? ' (panels with their own chrome)' : ''}`, async () => {
			const { container } = await render(ComposerProbe, { legend: LEGEND, titled });
			await plots(container);
			const item = [...container.querySelectorAll<HTMLElement>('[role="button"]')].find((el) =>
				el.textContent?.includes('Employment')
			)!;
			item.click();
			await vi.waitFor(() => {
				for (const plot of container.querySelectorAll('.dct-plot')) {
					const opacities = [...plot.querySelectorAll<SVGPathElement>('path')].map(
						(p) => p.style.strokeOpacity
					);
					expect(opacities).toContain('0.1');
				}
			});
		});
	}

	test('hover.sync shows the hovered x in every panel', async () => {
		const { container } = await render(ComposerProbe, { sync: true });
		const [first] = await plots(container);
		const rect = first.getBoundingClientRect();
		first.querySelector('svg')!.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: rect.left + rect.width / 2,
				clientY: rect.top + rect.height / 2
			})
		);
		await vi.waitFor(() => expect(container.querySelectorAll('.dct-tooltip').length).toBe(2));
	});

	test('without sync, a hover stays in its own panel', async () => {
		const { container } = await render(ComposerProbe, {});
		const [first] = await plots(container);
		const rect = first.getBoundingClientRect();
		first.querySelector('svg')!.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: rect.left + rect.width / 2,
				clientY: rect.top + rect.height / 2
			})
		);
		await vi.waitFor(() => expect(container.querySelectorAll('.dct-tooltip').length).toBe(1));
		await new Promise((r) => setTimeout(r, 100));
		expect(container.querySelectorAll('.dct-tooltip').length).toBe(1);
	});

	test('its timeline drives every panel, which draws no scrubber of its own', async () => {
		const { container } = await render(ComposerProbe, { progress: 0 });
		await plots(container);
		expect(container.querySelectorAll('.dct-timeline__gutter').length).toBe(0);
		await vi.waitFor(() => {
			for (const plot of container.querySelectorAll('.dct-plot')) {
				// The first step only: one point per line, on axes that span every step.
				const lines = [...plot.querySelectorAll('path')].map((p) => p.getAttribute('d') ?? '');
				expect(lines.length).toBeGreaterThan(0);
				for (const d of lines) expect(d).not.toContain('L');
				const xTicks = [...plot.querySelectorAll('.axis-x text')].map((t) => t.textContent);
				expect(xTicks.at(0)).toBe('2018');
				expect(xTicks.at(-1)).toBe('2020');
			}
		});
	});
});

describe('PlotPanel - inset', () => {
	test('floats over the composition at its fractions, taking no grid cell', async () => {
		const { container } = await render(InsetProbe, {});
		await vi.waitFor(() => expect(container.querySelectorAll('.dct-plot').length).toBe(2));
		const grid = container.querySelector('.dct-composer')!.getBoundingClientRect();
		const [main, inset] = [...container.querySelectorAll<HTMLElement>('.dct-panel')].map((p) =>
			p.getBoundingClientRect()
		);
		expect(main.width).toBeCloseTo(grid.width, 0);
		expect(inset.left - grid.left).toBeCloseTo(grid.width * 0.5, 0);
		expect(inset.top - grid.top).toBeCloseTo(0, 0);
		expect(inset.width).toBeCloseTo(grid.width * 0.5, 0);
		expect(inset.height).toBeCloseTo(grid.height * 0.5, 0);
	});
});
