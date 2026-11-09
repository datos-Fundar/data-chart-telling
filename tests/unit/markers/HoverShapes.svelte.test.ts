import { render } from 'vitest-browser-svelte';
import { describe, expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import TreemapPlot from '$lib/plots/part-of-a-whole/treemap/Plot.svelte';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import HistogramPlot from '$lib/plots/distribution/histogram/Plot.svelte';
import LollipopPlot from '$lib/plots/ranking/lollipop/Plot.svelte';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { PENGUIN_COUNTS } from '$datasets';
import { HoverShapes } from '$lib/layout/hover/HoverShapes';
import { getConfiguration } from '$lib/configuration/config.svelte';
import { waitForSvg } from '../plots/_helpers/svg';

const styleOf = (el: Element) => getComputedStyle(el);
const opacityOf = (el: Element) => Number(styleOf(el).fillOpacity);
const area = (el: Element) => {
	const { width, height } = el.getBoundingClientRect();
	return width * height;
};

/**
 * Ends any hover the browser's own pointer began, left over another test's plot where this one draws, so a test
 * starts with nothing hovered.
 */
const rest = (hitArea: Element) => hitArea.dispatchEvent(new PointerEvent('pointerleave'));

/** Lightens the hovered shape and dims the rest. */
const HOVER = { type: 'hover', active: { fillOpacity: 1 }, others: { fillOpacity: 0.3 } } as const;

describe('HoverShapes', () => {
	const rows = [{ v: 1 }, { v: 2 }];
	const marker = { type: 'rect', data: rows, hover: 'style' as const, styles: { fill: 'red' } };
	const reach = {
		roleOf: (row: Record<string, unknown>) => (row.v === 1 ? 'active' : 'other') as 'active',
		dimmed: () => false,
		cfg: getConfiguration()
	};

	test('leaves a marker as it is without a hover marker that styles shapes', () => {
		const parts = new HoverShapes([{ type: 'hover' }]).split(marker, rows, reach);
		expect(parts).toEqual([{ key: '', marker }]);
		expect(parts[0].marker).toBe(marker);
	});

	test('leaves a marker not linked to the hover, or only a trigger of it, as it is', () => {
		const shapes = new HoverShapes([HOVER]);
		for (const hover of [undefined, false, 'trigger'] as const) {
			const own = { ...marker, hover };
			expect(shapes.split(own, rows, reach)[0].marker).toBe(own);
		}
	});

	test('splits a linked marker by how the hover reaches each row, the hovered last', () => {
		const parts = new HoverShapes([HOVER]).split(marker, rows, reach);
		expect(parts.map((p) => p.key)).toEqual(['o', 'a']);
		expect(parts[1].marker.data).toEqual([{ v: 1 }]);
		expect(parts[1].marker.styles).toEqual({ fill: 'red', fillOpacity: 1 });
		expect(parts[0].marker.styles).toEqual({ fill: 'red', fillOpacity: 0.3 });
	});

	test("a dot marker's shapes take the styles under its own names", () => {
		const dots = { type: 'dot', data: rows, hover: 'style' as const, styles: { dotFill: 'red' } };
		const shapes = new HoverShapes([
			{ type: 'hover', active: { fill: 'blue', strokeWidth: 2 }, others: { fillOpacity: 0.3 } }
		]);
		const [other, active] = shapes.split(dots, rows, reach);
		expect(active.marker.styles).toEqual({ dotFill: 'blue', dotStrokeWidth: 2 });
		expect(other.marker.styles).toEqual({ dotFill: 'red', dotFillOpacity: 0.3 });
	});

	test('a dimmed row keeps its fill and opacities, and takes the rest', () => {
		const shapes = new HoverShapes([
			{ type: 'hover', active: { fill: 'blue', fillOpacity: 1, strokeWidth: 3 } }
		]);
		const parts = shapes.split(marker, rows, { ...reach, dimmed: () => true });
		// The row the hover does not style is drawn as it was.
		expect(parts.map((p) => p.key)).toEqual(['', 'a~']);
		expect(parts[0].marker.styles).toBe(marker.styles);
		expect(parts[1].marker.styles).toEqual({ fill: 'red', strokeWidth: 3 });
	});
});

describe("the hover marker restyles the plots' own shapes", () => {
	const ROWS = [
		{ c: 'A', v: 1, w: 2 },
		{ c: 'B', v: 3, w: 1 },
		{ c: 'C', v: 2, w: 3 }
	];

	test("a scatter plot's dots", async () => {
		const { container } = await render(ScatterPlot, {
			width: 400,
			height: 300,
			data: ROWS,
			x: 'v',
			y: 'w',
			markers: [{ type: 'hover', others: { fillOpacity: 0.3 } }]
		});
		const svg = await waitForSvg(container);
		const dots = () => Array.from(svg.querySelectorAll<SVGPathElement>('g.dot path'));
		await expect.poll(() => dots().length).toBe(3);
		await userEvent.hover(page.elementLocator(dots()[0]), { force: true });
		await vi.waitFor(() => {
			const opacities = dots().map(opacityOf);
			expect(opacities.filter((o) => o === 0.3)).toHaveLength(2);
		});
		await userEvent.unhover(page.elementLocator(svg));
	});

	test("a histogram's bins", async () => {
		const { container } = await render(HistogramPlot, {
			width: 400,
			height: 300,
			data: [1, 1, 2, 5, 5, 5, 8, 9].map((v) => ({ v })),
			x: 'v',
			markers: [{ type: 'hover', back: [], others: { fillOpacity: 0.2 } }]
		});
		const svg = await waitForSvg(container);
		const bins = () =>
			Array.from(svg.querySelectorAll<SVGRectElement>('rect[style]')).filter(
				(r) => r.style.fill && r.style.fill !== 'transparent'
			);
		await expect.poll(() => bins().length).toBeGreaterThan(1);
		const count = bins().length;
		await userEvent.hover(page.elementLocator(svg), { force: true });
		await vi.waitFor(() => {
			expect(bins().filter((b) => opacityOf(b) === 0.2)).toHaveLength(count - 1);
		});
		await userEvent.unhover(page.elementLocator(svg));
	});

	test("an author's marker linked with hover: true hovers the shape under the pointer, and takes the styles", async () => {
		const data = [1, 2, 3, 4].map((x) => ({ x, y: x * 2 }));
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			data,
			x: 'x',
			y: 'y',
			markers: [
				{ type: 'dot', hover: true, styles: { dotRadius: 6 } },
				{
					type: 'hover',
					back: [],
					front: [],
					active: { fill: 'rgb(255, 0, 0)' },
					others: { fillOpacity: 0.2 }
				}
			]
		});
		const svg = await waitForSvg(container);
		const dots = () => Array.from(svg.querySelectorAll<SVGPathElement>('g.dot path'));
		await expect.poll(() => dots().length).toBe(4);
		const target = dots()[2].getBoundingClientRect();
		await userEvent.hover(page.elementLocator(dots()[2]), { force: true });
		await vi.waitFor(() => {
			const red = dots().filter((d) => styleOf(d).fill === 'rgb(255, 0, 0)');
			expect(red).toHaveLength(1);
			// The one under the pointer, not the marker's first row.
			const box = red[0].getBoundingClientRect();
			expect(Math.abs(box.left - target.left)).toBeLessThan(1);
			expect(dots().filter((d) => opacityOf(d) === 0.2)).toHaveLength(3);
		});
		await userEvent.unhover(page.elementLocator(svg));
	});

	test("a lollipop's dots, scoped to their series", async () => {
		const { container } = await render(LollipopPlot, {
			width: 400,
			height: 300,
			data: ROWS,
			x: 'c',
			y: 'v',
			markers: [{ type: 'hover', front: [], others: { fill: 'rgb(255, 0, 0)' } }]
		});
		const svg = await waitForSvg(container);
		const dots = () => Array.from(svg.querySelectorAll<SVGPathElement>('g.dot path'));
		await expect.poll(() => dots().length).toBe(3);
		await userEvent.hover(page.elementLocator(dots()[0]), { force: true });
		await vi.waitFor(() => {
			expect(dots().filter((d) => styleOf(d).fill === 'rgb(255, 0, 0)')).toHaveLength(2);
		});
		await userEvent.unhover(page.elementLocator(svg));
	});
});

describe('the hover marker restyles a treemap tile', () => {
	type Row = { sector: string; branch: string; value: number };
	const ROWS: Row[] = [
		{ sector: 'Terciarias', branch: 'Comercio', value: 15 },
		{ sector: 'Terciarias', branch: 'Resto', value: 21 },
		{ sector: 'Terciarias', branch: 'Comunicaciones', value: 8 },
		{ sector: 'Secundarias', branch: 'Química', value: 3 },
		{ sector: 'Secundarias', branch: 'Alimentos', value: 2.9 },
		{ sector: 'Primarias', branch: 'Pesca', value: 1 }
	];
	const props = {
		width: 800,
		height: 500,
		data: ROWS,
		value: 'value',
		grouping: 'sector.branch'
	} as const;

	const rects = (svg: SVGElement) =>
		Array.from(svg.querySelectorAll<SVGRectElement>('rect')).filter((r) => !r.closest('clipPath'));
	const tiles = (svg: SVGElement) =>
		rects(svg).filter((r) => r.style.fill && r.style.fill !== 'transparent');
	const hitAreas = (svg: SVGElement) => rects(svg).filter((r) => r.style.fill === 'transparent');
	/** The invisible rectangle over the biggest tile, Resto's, and the biggest tile itself. */
	const biggest = (all: SVGRectElement[]) => all.reduce((a, b) => (area(a) > area(b) ? a : b));
	/** The label a tile writes in itself - its name over its share, in lines - not the hover marker's own. */
	const labelOf = (svg: SVGElement, word: string) =>
		Array.from(svg.querySelectorAll<SVGTextElement>('g.text text')).find(
			(t) => t.querySelector('tspan') && t.textContent?.startsWith(word)
		);

	test('draws as it always did while nothing is hovered, and with no shape styles at all', async () => {
		const { container } = await render(TreemapPlot, {
			...props,
			markers: [{ type: 'hover', front: [{ type: 'dot' }] }]
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(ROWS.length);
		biggest(hitAreas(svg)).dispatchEvent(new PointerEvent('pointerenter'));
		// The author's dot shows the hover is on.
		await expect.poll(() => svg.querySelectorAll('g.dot path').length).toBeGreaterThan(0);
		expect(tiles(svg).every((t) => opacityOf(t) === 1)).toBe(true);
	});

	test("a treemap's own hover draws no crosshair, dot or label", async () => {
		const { container } = await render(TreemapPlot, { ...props, markers: [{ type: 'hover' }] });
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(ROWS.length);
		const before = svg.querySelectorAll('g.text text').length;
		biggest(hitAreas(svg)).dispatchEvent(new PointerEvent('pointerenter'));
		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(svg.querySelectorAll('g.dot path')).toHaveLength(0);
		expect(svg.querySelectorAll('g.rule-x, g.rule-y, line')).toHaveLength(0);
		expect(svg.querySelectorAll('g.text text')).toHaveLength(before);
	});

	test('lightens the hovered tile and dims the others, over the segments, and back on leave', async () => {
		const { container } = await render(TreemapPlot, {
			...props,
			segments: { default: [{ styles: { fillOpacity: 0.6, stroke: 'gold' } }] },
			markers: [{ ...HOVER, active: { fillOpacity: 1, stroke: 'black' } }]
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(ROWS.length);
		const hit = biggest(hitAreas(svg));
		rest(hit);
		await expect.poll(() => tiles(svg).every((t) => opacityOf(t) === 0.6)).toBe(true);

		hit.dispatchEvent(new PointerEvent('pointerenter'));
		await vi.waitFor(() => {
			const all = tiles(svg);
			const hovered = biggest(all);
			expect(opacityOf(hovered)).toBe(1);
			expect(styleOf(hovered).stroke).toBe('rgb(0, 0, 0)');
			const rest = all.filter((t) => t !== hovered);
			expect(rest).toHaveLength(ROWS.length - 1);
			expect(rest.every((t) => opacityOf(t) === 0.3)).toBe(true);
			// What the hover does not set, the segments still do.
			expect(rest.every((t) => styleOf(t).stroke === 'rgb(255, 215, 0)')).toBe(true);
		});
		// Every label is still drawn, over its tile.
		expect(labelOf(svg, 'Resto')).toBeTruthy();

		hit.dispatchEvent(new PointerEvent('pointerleave'));
		await vi.waitFor(() => {
			expect(tiles(svg).every((t) => opacityOf(t) === 0.6)).toBe(true);
		});
	});

	test("a label inside a tile reads on the tile's hovered color", async () => {
		const { container } = await render(TreemapPlot, {
			...props,
			markers: [{ type: 'hover', active: { fill: 'black' }, others: { fill: 'white' } }]
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(ROWS.length);
		biggest(hitAreas(svg)).dispatchEvent(new PointerEvent('pointerenter'));
		await vi.waitFor(() => {
			// On black, the light candidate; on white, the dark one.
			expect(styleOf(labelOf(svg, 'Resto')!.querySelector('tspan')!).fill).toBe(
				'rgb(255, 255, 255)'
			);
			expect(styleOf(labelOf(svg, 'Comercio')!.querySelector('tspan')!).fill).toBe(
				'rgb(17, 24, 39)'
			);
		});
	});

	test('a sector the legend dims stays hoverable, but keeps its dimmed fill', async () => {
		const { container } = await render(TreemapPlot, {
			...props,
			tooltip: true,
			legend: { off: { Terciarias: 0.2 } },
			markers: [{ ...HOVER, active: { fillOpacity: 1, strokeWidth: 4 } }]
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => hitAreas(svg).length).toBe(ROWS.length);
		biggest(hitAreas(svg)).dispatchEvent(new PointerEvent('pointerenter'));
		await vi.waitFor(() => {
			const all = tiles(svg);
			const hovered = biggest(all);
			// Resto is in the dimmed sector: it takes the outline, not the full opacity.
			expect(opacityOf(hovered)).toBe(0.2);
			expect(styleOf(hovered).strokeWidth).toBe('4px');
			// A sector the legend shows dims under the hover.
			const shown = all.filter((t) => opacityOf(t) === 0.3);
			expect(shown).toHaveLength(3);
		});
	});

	test('a sector the legend hides is neither hovered nor restyled', async () => {
		const { container } = await render(TreemapPlot, {
			...props,
			legend: { off: { Terciarias: { mode: 'hide' } } },
			markers: [{ ...HOVER, others: { fillOpacity: 0.3, stroke: 'red' } }]
		});
		const svg = await waitForSvg(container);
		// Only the tiles of the sectors left are hit areas.
		await expect.poll(() => hitAreas(svg).length).toBe(3);
		biggest(hitAreas(svg)).dispatchEvent(new PointerEvent('pointerenter'));
		await vi.waitFor(() => {
			const all = tiles(svg);
			expect(all.filter((t) => opacityOf(t) === 1)).toHaveLength(1);
			expect(all.filter((t) => opacityOf(t) === 0.3)).toHaveLength(2);
		});
		const hidden = tiles(svg).filter((t) => opacityOf(t) === 0);
		expect(hidden).toHaveLength(3);
		expect(hidden.every((t) => styleOf(t).stroke !== 'rgb(255, 0, 0)')).toBe(true);
	});
});

describe('the hover marker restyles a grouped bar', () => {
	const DATA = [
		{ cat: 'A', series: 'female', value: 10 },
		{ cat: 'A', series: 'male', value: 20 },
		{ cat: 'B', series: 'female', value: 15 },
		{ cat: 'B', series: 'male', value: 5 }
	];
	const bars = (svg: SVGElement) =>
		Array.from(svg.querySelectorAll<SVGRectElement>('g.bar-y rect')).filter(
			(r) => !r.classList.contains('dct-hit-area')
		);
	const hitAreas = (svg: SVGElement) =>
		Array.from(svg.querySelectorAll<SVGRectElement>('rect.dct-hit-area'));

	test.each([
		['x', 2],
		['series', 2],
		['punctual', 1]
	] as const)('with the %s strategy, the bars it matches are active', async (strategy, active) => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 300,
			data: DATA,
			x: 'cat',
			y: 'value',
			color: 'series',
			markers: [{ ...HOVER, strategy }]
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => bars(svg).length).toBe(4);
		const hit = hitAreas(svg)[0];
		rest(hit);
		await expect.poll(() => bars(svg).every((b) => opacityOf(b) === 1)).toBe(true);
		hit.dispatchEvent(new PointerEvent('pointerenter'));
		await vi.waitFor(() => {
			const opacities = bars(svg).map(opacityOf);
			expect(opacities.filter((o) => o === 1)).toHaveLength(active);
			expect(opacities.filter((o) => o === 0.3)).toHaveLength(4 - active);
		});
	});
});

describe('the hover marker restyles a heatmap cell', () => {
	const cells = (svg: SVGElement) =>
		Array.from(svg.querySelectorAll<SVGRectElement>('g.cell rect'));

	test('the hovered cell keeps its look, the others dim', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			data: PENGUIN_COUNTS,
			x: 'island',
			y: 'species',
			color: 'count',
			markers: [{ type: 'hover', others: { fillOpacity: 0.3 } }]
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => cells(svg).length).toBe(PENGUIN_COUNTS.length);
		const target = cells(svg)[0];
		// The hover's own dot comes up over the cell, under the pointer.
		await userEvent.hover(page.elementLocator(target), { force: true });
		await vi.waitFor(() => {
			const opacities = cells(svg).map(opacityOf);
			expect(opacities.filter((o) => o === 0.3)).toHaveLength(PENGUIN_COUNTS.length - 1);
			expect(opacities.filter((o) => o === 1)).toHaveLength(1);
		});
	});
});
