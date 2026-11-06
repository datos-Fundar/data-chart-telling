import { render } from 'vitest-browser-svelte';
import { describe, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import TreemapPlot from '$lib/plots/part-of-a-whole/treemap/Plot.svelte';
import type { TreemapTooltipContext } from '$lib/types/plots/part-of-a-whole/treemap/props';
import { waitForSvg } from '../../_helpers/svg';

type Row = { sector: string; branch: string; kind: string; value: number };

const ROWS: Row[] = [
	{
		sector: 'Terciarias',
		kind: 'servicios',
		branch: 'Comercio mayorista, minorista y reparaciones',
		value: 15
	},
	{ sector: 'Terciarias', kind: 'servicios', branch: 'Resto', value: 21 },
	{ sector: 'Terciarias', kind: 'servicios', branch: 'Comunicaciones', value: 8 },
	{
		sector: 'Secundarias',
		kind: 'industria',
		branch: 'Fabricación de sustancias y productos químicos',
		value: 3
	},
	{
		sector: 'Secundarias',
		kind: 'industria',
		branch: 'Elaboración de productos alimenticios y bebidas',
		value: 2.9
	},
	{ sector: 'Secundarias', kind: 'industria', branch: 'Reciclamiento', value: 0.01 },
	{ sector: 'Primarias', kind: 'extracción', branch: 'Pesca', value: 0.03 }
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
/** The tiles drawn, not the invisible rectangles over them that the pointer finds. */
const tiles = (svg: SVGElement) =>
	rects(svg).filter((r) => r.style.fill && r.style.fill !== 'transparent');
const hitAreas = (svg: SVGElement) => rects(svg).filter((r) => r.style.fill === 'transparent');
const area = (el: Element) => {
	const { width, height } = el.getBoundingClientRect();
	return width * height;
};
const labels = (svg: SVGElement) =>
	Array.from(svg.querySelectorAll('g.text text')).map((t) =>
		Array.from(t.querySelectorAll('tspan')).map((s) => s.textContent)
	);
const styleOf = (el: Element) => getComputedStyle(el);

describe('TreemapPlot', () => {
	test('draws one tile per row, in the area of its value', async () => {
		const { container } = await render(TreemapPlot, { ...props });
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(ROWS.length);
		const areas = tiles(svg).map(area);
		const total = ROWS.reduce((sum, r) => sum + r.value, 0);
		const drawn = areas.reduce((sum, a) => sum + a, 0);
		// The biggest tile (Resto) is its share of the area, give or take the lines between tiles.
		expect(Math.max(...areas) / drawn).toBeCloseTo(21 / total, 1);
	});

	test('names a tile by the last level of its grouping, and nests them by all', async () => {
		const { container } = await render(TreemapPlot, {
			...props,
			grouping: 'sector.kind.branch'
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(ROWS.length);
		await expect.poll(() => labels(svg).flat().includes('Resto')).toBe(true);
	});

	test('adds up the rows of one path into a tile: grouping by sector alone makes three', async () => {
		const { container } = await render(TreemapPlot, { ...props, grouping: 'sector' });
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(3);
		await expect.poll(() => labels(svg).flat().includes('Terciarias')).toBe(true);
	});

	test('groups by color when grouping is unset, as every plot does', async () => {
		const { container } = await render(TreemapPlot, {
			width: 800,
			height: 500,
			data: ROWS,
			value: 'value',
			color: 'sector'
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(3);
		expect(new Set(tiles(svg).map((t) => styleOf(t).fill)).size).toBe(3);
	});

	test('takes a grouping function as a single level', async () => {
		const { container } = await render(TreemapPlot, {
			...props,
			grouping: (row: Record<string, unknown>) => String(row.sector).toUpperCase()
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(3);
		await expect.poll(() => labels(svg).flat().includes('TERCIARIAS')).toBe(true);
	});

	test('takes the options of its own treemap transform: tile', async () => {
		const { container } = await render(TreemapPlot, {
			...props,
			grouping: 'sector',
			transforms: [{ type: 'treemap', tile: 'dice' }]
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(3);
		// 'dice' sets the tiles side by side: every one spans the whole height.
		const heights = new Set(tiles(svg).map((t) => Math.round(t.getBoundingClientRect().height)));
		expect(heights.size).toBe(1);
	});

	test('colors the tiles by the outermost grouping level, one color per group', async () => {
		const { container } = await render(TreemapPlot, {
			...props,
			grouping: 'sector.kind.branch'
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(ROWS.length);
		expect(new Set(tiles(svg).map((t) => styleOf(t).fill)).size).toBe(3);
	});

	test('writes the name and the share on a tile big enough for them', async () => {
		const { container } = await render(TreemapPlot, { ...props });
		const svg = await waitForSvg(container);
		await expect.poll(() => labels(svg).length).toBeGreaterThan(0);
		const resto = labels(svg).find((lines) => lines.includes('Resto'));
		expect(resto).toBeDefined();
		// 21 of 49,94 is 42,05%, written with one decimal.
		expect(resto?.[resto.length - 1]).toBe('42,1%');
	});

	test('leaves a tile too small for any label bare', async () => {
		const { container } = await render(TreemapPlot, { ...props });
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(ROWS.length);
		await expect.poll(() => labels(svg).length).toBeGreaterThan(0);
		expect(labels(svg).length).toBeLessThan(ROWS.length);
	});

	test("takes the share's display fields from styles.values", async () => {
		const { container } = await render(TreemapPlot, {
			...props,
			styles: { values: { show: true, decimals: 0, suffix: ' %' } }
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => labels(svg).length).toBeGreaterThan(0);
		const resto = labels(svg).find((lines) => lines.includes('Resto'));
		expect(resto?.[resto.length - 1]).toBe('42 %');
	});

	test('draws no label with styles.values off', async () => {
		const { container } = await render(TreemapPlot, {
			...props,
			styles: { values: { show: false } }
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(ROWS.length);
		expect(labels(svg)).toEqual([]);
	});

	test('draws a white line between tiles unless styles.area sets one', async () => {
		const { container } = await render(TreemapPlot, { ...props });
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(ROWS.length);
		expect(new Set(tiles(svg).map((t) => styleOf(t).stroke))).toEqual(
			new Set(['rgb(255, 255, 255)'])
		);
	});

	test('styles every tile with styles.area', async () => {
		const { container } = await render(TreemapPlot, {
			...props,
			styles: {
				area: { stroke: 'midnightblue', strokeWidth: 3, fillOpacity: 0.6, borderRadius: 4 }
			}
		});
		const svg = await waitForSvg(container);
		await expect
			.poll(() => svg.querySelectorAll('path').length)
			.toBeGreaterThanOrEqual(ROWS.length);
		const drawn = Array.from(svg.querySelectorAll('path')).filter(
			(p) => styleOf(p).fillOpacity === '0.6'
		);
		expect(drawn).toHaveLength(ROWS.length);
		for (const tile of drawn) {
			expect(styleOf(tile).stroke).toBe('rgb(25, 25, 112)');
			expect(styleOf(tile).strokeWidth).toBe('3px');
		}
	});

	test('dims the tiles of a group turned off in the legend', async () => {
		const { container } = await render(TreemapPlot, {
			...props,
			legend: { off: { Terciarias: 0.2 } }
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(ROWS.length);
		const opacities = tiles(svg).map((t) => styleOf(t).fillOpacity);
		expect(opacities.filter((o) => o === '0.2')).toHaveLength(3);
		expect(opacities.filter((o) => o === '1')).toHaveLength(ROWS.length - 3);
	});

	test('draws a named dash style as its dash pattern', async () => {
		const { container } = await render(TreemapPlot, {
			...props,
			styles: { area: { strokeDasharray: 'dashed' } }
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(ROWS.length);
		expect(new Set(tiles(svg).map((t) => styleOf(t).strokeDasharray))).toEqual(
			new Set(['6px, 4px'])
		);
	});

	test("styles a group's tiles by its segment, over styles.area and under nothing else", async () => {
		const { container } = await render(TreemapPlot, {
			...props,
			styles: { area: { stroke: 'midnightblue', strokeWidth: 2 } },
			segments: {
				default: [{ styles: { fillOpacity: 0.25 } }],
				Terciarias: [{ styles: { fillOpacity: 1, stroke: 'gold' } }]
			}
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(ROWS.length);
		const all = tiles(svg);
		const gold = all.filter((t) => styleOf(t).stroke === 'rgb(255, 215, 0)');
		expect(gold).toHaveLength(3);
		expect(gold.every((t) => styleOf(t).fillOpacity === '1')).toBe(true);
		const rest = all.filter((t) => styleOf(t).stroke !== 'rgb(255, 215, 0)');
		expect(rest).toHaveLength(ROWS.length - 3);
		expect(rest.every((t) => styleOf(t).fillOpacity === '0.25')).toBe(true);
		// The styles.area line stays where no segment sets its own.
		expect(rest.every((t) => styleOf(t).stroke === 'rgb(25, 25, 112)')).toBe(true);
	});
});

describe('TreemapPlot - segments by the path of a tile', () => {
	const GOLD = 'rgb(255, 215, 0)';
	const GREEN = 'rgb(0, 128, 0)';
	const deep = { ...props, grouping: 'sector.kind.branch' };

	test("'Sector.kind' styles the tiles under that kind, over the sector's segment", async () => {
		const { container } = await render(TreemapPlot, {
			...deep,
			segments: {
				Terciarias: [{ styles: { stroke: 'gold' } }],
				'Secundarias.industria': [{ styles: { stroke: 'green' } }]
			}
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(ROWS.length);
		const strokes = tiles(svg).map((t) => styleOf(t).stroke);
		expect(strokes.filter((s) => s === GOLD)).toHaveLength(3);
		expect(strokes.filter((s) => s === GREEN)).toHaveLength(3);
	});

	test('the most specific path wins', async () => {
		const { container } = await render(TreemapPlot, {
			...deep,
			segments: {
				Terciarias: [{ styles: { stroke: 'gold' } }],
				'Terciarias.servicios': [{ styles: { stroke: 'green' } }],
				'Terciarias.servicios.Resto': [{ styles: { stroke: 'midnightblue' } }]
			}
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(ROWS.length);
		const strokes = tiles(svg).map((t) => styleOf(t).stroke);
		expect(strokes.filter((s) => s === GREEN)).toHaveLength(2);
		expect(strokes.filter((s) => s === 'rgb(25, 25, 112)')).toHaveLength(1);
		expect(strokes.filter((s) => s === GOLD)).toHaveLength(0);
	});
});

describe('TreemapPlot - hovering a tile', () => {
	/** The invisible rectangle over the biggest tile, which is Resto's. */
	const biggest = (svg: SVGElement) => hitAreas(svg).reduce((a, b) => (area(a) > area(b) ? a : b));

	test('shows its name and its share in the tooltip', async () => {
		const { container } = await render(TreemapPlot, { ...props, tooltip: true });
		const svg = await waitForSvg(container);
		await expect.poll(() => hitAreas(svg).length).toBe(ROWS.length);
		await userEvent.hover(page.elementLocator(biggest(svg)));
		await expect
			.poll(() => container.querySelector('.dct-tooltip')?.textContent)
			.toContain('Resto');
		expect(container.querySelector('.dct-tooltip')?.textContent).toContain('42,1%');
	});

	test("gives a tooltip's format the share of the tile in its context, and its series", async () => {
		const { container } = await render(TreemapPlot, {
			...props,
			tooltip: {
				format: (row: Record<string, unknown>, _number: unknown, context: TreemapTooltipContext) =>
					`${context.series} > ${row.branch} = ${row.value} = ${context.share.toFixed(0)}`
			}
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => hitAreas(svg).length).toBe(ROWS.length);
		await userEvent.hover(page.elementLocator(biggest(svg)));
		await expect
			.poll(() => container.querySelector('.dct-tooltip')?.textContent)
			.toContain('Terciarias > Resto = 21 = 42');
	});

	test('reads the same when the values are percentages already', async () => {
		// The shares of a whole that already adds up to 100: the library renormalizes whatever the unit.
		const percentages = ROWS.map((row) => ({ ...row, value: (row.value / 49.94) * 100 }));
		const { container } = await render(TreemapPlot, { ...props, data: percentages, tooltip: true });
		const svg = await waitForSvg(container);
		await expect.poll(() => hitAreas(svg).length).toBe(ROWS.length);
		await userEvent.hover(page.elementLocator(biggest(svg)));
		await expect
			.poll(() => container.querySelector('.dct-tooltip')?.textContent)
			.toContain('42,1%');
	});
});

describe('TreemapPlot - colors down the levels', () => {
	const deep = { ...props, grouping: 'sector.kind.branch' } as const;

	test('scales.color.depth 2 gives each kind a tone of its sector, depth 3 each branch', async () => {
		const fills = async (depth: number) => {
			const { container } = await render(TreemapPlot, { ...deep, scales: { color: { depth } } });
			const svg = await waitForSvg(container);
			await expect.poll(() => tiles(svg).length).toBe(ROWS.length);
			return new Set(tiles(svg).map((t) => styleOf(t).fill)).size;
		};
		expect(await fills(1)).toBe(3);
		// Terciarias has one kind (servicios), as does each other sector: three tones, one per sector.
		expect(await fills(2)).toBe(3);
		expect(await fills(3)).toBe(ROWS.length);
	});
});

describe('TreemapPlot - a sector taken out by the legend', () => {
	/** The share written on the tile whose label starts with `word` - a long name takes several lines. */
	const shareOf = (svg: SVGElement, word: string) =>
		labels(svg)
			.find((lines) => lines[0]?.startsWith(word))
			?.at(-1);

	test("'omit' keeps every other tile's share of the whole", async () => {
		const { container } = await render(TreemapPlot, {
			...props,
			legend: { off: { Terciarias: { mode: 'omit' } } }
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(4);
		// 3 of 49,94 is 6,0%, as with every sector on.
		await expect.poll(() => shareOf(svg, 'Fabricación de sustancias')).toBe('6,0%');
	});

	test("'hide' makes its tiles and their labels transparent, in place", async () => {
		const { container } = await render(TreemapPlot, {
			...props,
			legend: { off: { Terciarias: { mode: 'hide' } } }
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(ROWS.length);
		const hidden = tiles(svg).filter((t) => styleOf(t).fillOpacity === '0');
		expect(hidden).toHaveLength(3);
		const resto = Array.from(svg.querySelectorAll('g.text text')).find((t) =>
			t.textContent?.startsWith('Resto')
		);
		// The opacity is on each line of the label.
		const lines = Array.from(resto!.querySelectorAll('tspan'));
		expect(lines.length).toBeGreaterThan(0);
		expect(lines.every((line) => styleOf(line).fillOpacity === '0')).toBe(true);
	});

	test("'rescale' makes the sectors left the new whole", async () => {
		const { container } = await render(TreemapPlot, {
			...props,
			legend: { off: { Terciarias: { mode: 'rescale' } } }
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(4);
		// 3 of the 5,94 left is 50,5%.
		await expect.poll(() => shareOf(svg, 'Fabricación de sustancias')).toBe('50,5%');
	});
});

describe('TreemapPlot - an interactive automatic legend', () => {
	test("clicking a sector with 'rescale' makes the others the new whole", async () => {
		const { container } = await render(TreemapPlot, {
			...props,
			legend: { series: { interactive: { enabled: true, disabled: { mode: 'rescale' } } } }
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => tiles(svg).length).toBe(ROWS.length);
		const item = Array.from(container.querySelectorAll<HTMLElement>('.dct-discrete__item')).find(
			(el) => el.textContent?.includes('Terciarias')
		)!;
		item.click();
		await expect.poll(() => tiles(svg).length).toBe(4);
	});
});
