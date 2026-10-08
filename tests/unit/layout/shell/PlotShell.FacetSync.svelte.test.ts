import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';

type Row = { region: string; year: number; value: number };

const DATA: Row[] = ['North', 'South'].flatMap((region, i) =>
	[2000, 2005, 2010, 2015, 2020].map((year, j) => ({ region, year, value: 10 + i * 5 + j }))
);

async function hoverFirstFacet(container: Element): Promise<void> {
	await vi.waitFor(() => expect(container.querySelectorAll('.dct-plot').length).toBe(2));
	const plotEl = container.querySelector('.dct-plot')!;
	const svg = plotEl.querySelector('svg')!;
	const rect = plotEl.getBoundingClientRect();
	svg.dispatchEvent(
		new PointerEvent('pointermove', {
			bubbles: true,
			clientX: rect.left + rect.width / 2,
			clientY: rect.top + rect.height / 2
		})
	);
}

describe('PlotShell - hover across facets', () => {
	test('`tooltip.sync` shows the hovered x in every facet', async () => {
		const { container } = await render(LinePlot, {
			width: 640,
			height: 300,
			data: DATA,
			x: 'year',
			y: 'value',
			facet: { by: 'region', columns: 2 },
			tooltip: { sync: true }
		});
		await hoverFirstFacet(container);
		await vi.waitFor(() => expect(container.querySelectorAll('.dct-tooltip').length).toBe(2));
	});

	test('without sync only the hovered facet shows a tooltip', async () => {
		const { container } = await render(LinePlot, {
			width: 640,
			height: 300,
			data: DATA,
			x: 'year',
			y: 'value',
			facet: { by: 'region', columns: 2 },
			tooltip: true
		});
		await hoverFirstFacet(container);
		await vi.waitFor(() => expect(container.querySelectorAll('.dct-tooltip').length).toBe(1));
		await new Promise((r) => setTimeout(r, 100));
		expect(container.querySelectorAll('.dct-tooltip').length).toBe(1);
	});

	test('a title mounts the container chrome around the facets', async () => {
		const { container } = await render(LinePlot, {
			width: 640,
			height: 300,
			data: DATA,
			x: 'year',
			y: 'value',
			title: 'Values by region',
			facet: { by: 'region', columns: 2 }
		});
		await vi.waitFor(() =>
			expect(container.querySelector('.dct-plot-container__title')?.textContent).toBe(
				'Values by region'
			)
		);
	});
});
