import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import ComposerProbe from './ComposerProbe.svelte';
import InsetProbe from './InsetProbe.svelte';
import AlignProbe from './AlignProbe.svelte';
import PlacementProbe from './PlacementProbe.svelte';

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
		expect(container.querySelector('.dct-figure-chrome__title')?.textContent).toBe('Composed');
	});

	test('tags its panels in order', async () => {
		const { container } = await render(ComposerProbe, { tags: 'A' });
		await plots(container);
		const tags = [...container.querySelectorAll('.dct-grid-cell--figure .dct-grid-cell__label')].map((t) => t.textContent);
		expect(tags).toEqual(['A', 'B']);
	});

	test('layout.areas places panels by name', async () => {
		const { container } = await render(ComposerProbe, {
			layout: { areas: ['south north'] }
		});
		await plots(container);
		// The first panel (North) sits in the `north` area, right of `south`.
		const rects = [...container.querySelectorAll<HTMLElement>('.dct-grid-cell--figure')].map(
			(p) => p.getBoundingClientRect().left
		);
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
		expect(container.querySelectorAll('.dct-timeline__gutter').length).toBe(1);
		expect(container.querySelectorAll('.dct-grid-cell--figure .dct-timeline__gutter').length).toBe(0);
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

describe('PlotComposer - an inset plot', () => {
	test('floats over the composition at its fractions, taking no grid cell', async () => {
		const { container } = await render(InsetProbe, {});
		await vi.waitFor(() => expect(container.querySelectorAll('.dct-plot').length).toBe(2));
		const grid = container.querySelector('.dct-grid')!.getBoundingClientRect();
		const [main, inset] = [...container.querySelectorAll<HTMLElement>('.dct-grid-cell--figure')].map((p) =>
			p.getBoundingClientRect()
		);
		expect(main.width).toBeCloseTo(grid.width, 0);
		expect(inset.left - grid.left).toBeCloseTo(grid.width * 0.5, 0);
		expect(inset.top - grid.top).toBeCloseTo(0, 0);
		expect(inset.width).toBeCloseTo(grid.width * 0.5, 0);
		expect(inset.height).toBeCloseTo(grid.height * 0.5, 0);
	});
});

describe('PlotComposer - layout.align', () => {
	/** Where each panel's line starts - its plot area's left edge. */
	async function lineStarts(container: Element): Promise<number[]> {
		await plots(container);
		return [...container.querySelectorAll('.dct-plot')].map(
			(plot) => plot.querySelector('g.lines path, path')!.getBoundingClientRect().left
		);
	}

	test('without it, each panel sizes its own left margin', async () => {
		const { container } = await render(AlignProbe, {});
		const [a, b] = await lineStarts(container);
		expect(Math.abs(a - b)).toBeGreaterThan(10);
	});

	test('with it, every plot area in the column starts at the same x', async () => {
		const { container } = await render(AlignProbe, { align: true });
		await vi.waitFor(async () => {
			const [a, b] = await lineStarts(container);
			expect(Math.abs(a - b)).toBeLessThan(1);
		});
	});
});

describe('PlotComposer - without chrome', () => {
	test('still stamps the theme vars its panels read', async () => {
		const { container } = await render(AlignProbe, {});
		await plots(container);
		const grid = container.querySelector<HTMLElement>('.dct-grid')!;
		expect(getComputedStyle(grid).getPropertyValue('--dct-facet-indicator-bg')).not.toBe('');
	});
});

describe('PlotComposer - placing its children', () => {
	test('every figure drawn straight in it takes a cell; one inside a GridCell takes no other', async () => {
		const { container } = await render(PlacementProbe, {});
		await plots(container, 4);
		const outer = container.querySelector('.dct-grid')!;
		const cells = [...outer.children].filter((c) => c.classList.contains('dct-grid-cell'));
		const tags = cells.map((c) => c.querySelector(':scope > .dct-grid-cell__label')?.textContent);
		expect(tags).toEqual(['A', 'B', 'C']);
		const nested = [...cells[2].querySelectorAll(':scope .dct-grid .dct-grid-cell__label')].map((t) => t.textContent);
		expect(nested).toEqual(['i', 'ii']);
	});
});
