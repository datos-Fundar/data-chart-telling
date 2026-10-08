import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import LinePlot from '$lib/plots/line/Plot.svelte';

type Row = { region: string; sex: string; category: string; value: number };

const DATA: Row[] = [
	{ region: 'North', sex: 'F', category: 'a', value: 2 },
	{ region: 'North', sex: 'F', category: 'b', value: 4 },
	{ region: 'North', sex: 'M', category: 'a', value: 3 },
	{ region: 'South', sex: 'F', category: 'b', value: 200 },
	{ region: 'South', sex: 'F', category: 'c', value: 400 },
	{ region: 'South', sex: 'M', category: 'c', value: 300 }
];

/** Every facet's y tick labels, in render order. */
async function yTicksPerFacet(container: Element, count: number): Promise<string[][]> {
	await vi.waitFor(() => {
		const svgs = container.querySelectorAll('.dct-plot svg');
		expect(svgs.length).toBe(count);
		for (const svg of svgs) expect(svg.querySelectorAll('.axis-y text').length).toBeGreaterThan(0);
	});
	return [...container.querySelectorAll('.dct-plot svg')].map((svg) =>
		[...svg.querySelectorAll('.axis-y text')].map((t) => t.textContent ?? '')
	);
}

function xTicks(svg: Element): string[] {
	return [...svg.querySelectorAll('.axis-x text')].map((t) => t.textContent ?? '');
}

describe('PlotShell - facet scales', () => {
	test('facets share their y axis by default', async () => {
		const { container } = await render(BarPlot, {
			width: 600,
			height: 300,
			data: DATA,
			x: 'category',
			y: 'value',
			facet: { by: 'region', columns: 2 }
		});
		const [north, south] = await yTicksPerFacet(container, 2);
		expect(north).toEqual(south);
	});

	test('facets share their category axis by default: each bar plot shows every category', async () => {
		const { container } = await render(BarPlot, {
			width: 600,
			height: 300,
			data: DATA,
			x: 'category',
			y: 'value',
			facet: { by: 'region', columns: 2 }
		});
		await yTicksPerFacet(container, 2);
		for (const svg of container.querySelectorAll('.dct-plot svg')) {
			expect(xTicks(svg)).toEqual(['a', 'b', 'c']);
		}
	});

	test("scales: 'free' lets each facet fit its own y axis", async () => {
		const { container } = await render(BarPlot, {
			width: 600,
			height: 300,
			data: DATA,
			x: 'category',
			y: 'value',
			facet: { by: 'region', columns: 2, scales: 'free' }
		});
		const [north, south] = await yTicksPerFacet(container, 2);
		expect(north).not.toEqual(south);
	});

	test('a pinned author domain wins over the shared one', async () => {
		const { container } = await render(LinePlot, {
			width: 600,
			height: 300,
			data: DATA,
			x: 'category',
			y: 'value',
			scales: { y: { domain: [0, 1000] } },
			facet: { by: 'region', columns: 2 }
		});
		const [north] = await yTicksPerFacet(container, 2);
		expect(north.at(-1)).toBe('1 mil');
		expect(north).toHaveLength(6);
	});
});

describe('PlotShell - rows/cols grid', () => {
	test('one facet per rows × cols combination, labelled on each strip', async () => {
		const { container } = await render(BarPlot, {
			width: 640,
			height: 400,
			data: DATA,
			x: 'category',
			y: 'value',
			facet: { rows: 'sex', cols: 'region' }
		});
		await yTicksPerFacet(container, 4);
		const colStrips = [...container.querySelectorAll('.dct-facet-grid__strip--col')].map(
			(s) => s.textContent
		);
		const rowStrips = [...container.querySelectorAll('.dct-facet-grid__strip--row')].map(
			(s) => s.textContent
		);
		expect(colStrips).toEqual(['North', 'South']);
		expect(rowStrips).toEqual(['F', 'M']);
	});

	test("axes: 'outer' drops inner axes and gives every panel the same box", async () => {
		const { container } = await render(BarPlot, {
			width: 640,
			height: 400,
			data: DATA,
			x: 'category',
			y: 'value',
			facet: { rows: 'sex', cols: 'region', axes: 'outer' }
		});
		const cell = (row: string, col: string) =>
			container.querySelector(`.dct-facet-grid__cell[data-row="${row}"][data-col="${col}"]`)!;
		await vi.waitFor(() => {
			expect(cell('F', 'North').querySelector('.axis-y')).toBeTruthy();
			expect(cell('F', 'North').querySelector('.axis-x')).toBeNull();
			expect(cell('M', 'South').querySelector('.axis-y')).toBeNull();
			expect(cell('M', 'South').querySelector('.axis-x')).toBeTruthy();
		});
		// Every panel - the frame svelteplot draws its marks in - ends up the same size.
		await vi.waitFor(() => {
			const panels = ['F', 'M'].flatMap((row) =>
				['North', 'South'].map((col) => {
					const clip = cell(row, col).querySelector('clipPath rect, svg > rect')!;
					const box = clip.getBoundingClientRect();
					return [Math.round(box.width), Math.round(box.height)];
				})
			);
			for (const [w, h] of panels) {
				expect(Math.abs(w - panels[0][0])).toBeLessThanOrEqual(1);
				expect(Math.abs(h - panels[0][1])).toBeLessThanOrEqual(1);
			}
		});
	});

	test("axes: 'outer' titles each drawn y axis vertically beside its ticks, with the channel's name", async () => {
		const { container } = await render(BarPlot, {
			width: 640,
			height: 400,
			data: DATA,
			x: 'category',
			y: 'value',
			facet: { rows: 'sex', cols: 'region', axes: 'outer' }
		});
		const cell = (row: string, col: string) =>
			container.querySelector(`.dct-facet-grid__cell[data-row="${row}"][data-col="${col}"]`)!;
		const verticalTitle = (el: Element) =>
			[...el.querySelectorAll('text')].find((t) =>
				t.getAttribute('transform')?.startsWith('rotate(-90')
			);
		await vi.waitFor(() => {
			for (const row of ['F', 'M']) {
				const left = cell(row, 'North');
				expect(verticalTitle(left)?.textContent).toBe('value');
				expect(left.querySelector('.axis-y-title')).toBeNull();
				expect(verticalTitle(cell(row, 'South'))).toBeUndefined();
			}
		});
		// The title clears the tick labels instead of overlapping them.
		await vi.waitFor(() => {
			const left = cell('F', 'North');
			const title = verticalTitle(left)!.getBoundingClientRect();
			const ticks = [...left.querySelectorAll('.axis-y text')].map(
				(t) => t.getBoundingClientRect().left
			);
			expect(title.right).toBeLessThanOrEqual(Math.min(...ticks));
		});
	});
});
