import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import Plot from '$lib/plots/generic/Plot.svelte';
import SankeyPlot from '$lib/plots/flow/sankey/Plot.svelte';
import TreemapPlot from '$lib/plots/part-of-a-whole/treemap/Plot.svelte';
import { PENGUIN_COUNTS_BY_SEX } from '$datasets';
import { waitForSvg } from '../plots/_helpers/svg';

/** Each text drawn: what it reads, its lines joined with no space, and the size it is written at. */
function textsOf(svg: SVGElement) {
	return [...svg.querySelectorAll<SVGTextElement>('text')].map((t) => {
		const own = t.style.fontSize || t.querySelector('tspan')?.style.fontSize || '';
		return { text: (t.textContent ?? '').replace(/\s+/g, ''), size: parseFloat(own) };
	});
}

/** A tall, narrow box: 8 of 100 across, 90 of 100 up, on a 400 x 300 plot. */
const BOX = { x1: 10, x2: 18, y1: 5, y2: 95 };
const TEXT = 'A tall narrow label';
const WRITTEN = TEXT.replace(/\s+/g, '');

/** Draws `marker` on a plot whose scales span 0-100, and waits for the rect. */
async function draw(marker: Record<string, unknown>) {
	const { container } = await render(Plot, {
		width: 400,
		height: 300,
		scales: { x: { domain: [0, 100] }, y: { domain: [0, 100] } },
		markers: [
			{
				type: 'rect',
				data: [BOX],
				x1: 'x1',
				x2: 'x2',
				y1: 'y1',
				y2: 'y2',
				styles: { fill: 'tomato' }
			},
			marker
		]
	} as never);
	const svg = await waitForSvg(container);
	await expect
		.poll(() => svg.querySelector('rect[style*="tomato"], path[style*="tomato"]'))
		.toBeTruthy();
	// Labels fit once the scales settle.
	await new Promise((resolve) => setTimeout(resolve, 150));
	return svg;
}

/** The label of the box, when it is written whole; `undefined` when it was cut short or left out. */
const wholeOf = (svg: SVGElement) => textsOf(svg).find((t) => t.text === WRITTEN);

describe('a fitted text turned a quarter', () => {
	/** An author's text fitted to the box, turned `rotate` degrees. */
	const fitted = (rotate: number) =>
		draw({
			type: 'text',
			data: [BOX],
			x: (d: typeof BOX) => (d.x1 + d.x2) / 2,
			y: (d: typeof BOX) => (d.y1 + d.y2) / 2,
			text: () => TEXT,
			styles: { fontSize: 13, rotate },
			fit: { x1: 'x1', x2: 'x2', y1: 'y1', y2: 'y2' }
		});

	test('unturned, the box is too narrow to write it whole', async () => {
		expect(wholeOf(await fitted(0))).toBeUndefined();
	});

	test.each([-90, 90, 270])(
		"at %i°, runs along the box's height and is written whole",
		async (rotate) => {
			expect(wholeOf(await fitted(rotate))?.size).toBe(13);
		}
	);

	test('at any other angle, is still measured across the box', async () => {
		expect(wholeOf(await fitted(45))).toBeUndefined();
	});
});

describe("a 'box' label turned a quarter", () => {
	test("of an author's marker runs along its shape's height", async () => {
		const label = (rotate: number) =>
			draw({
				type: 'rect',
				data: [BOX],
				x1: 'x1',
				x2: 'x2',
				y1: 'y1',
				y2: 'y2',
				styles: { fill: 'transparent' },
				label: { layout: 'box', text: () => TEXT, styles: { fontSize: 13, rotate } }
			});
		expect(wholeOf(await label(0))).toBeUndefined();
		expect(wholeOf(await label(-90))?.size).toBe(13);
	});

	test("of a plot kind's own labels: a sankey's nodes", async () => {
		const sankey = async (rotate: number) => {
			const { container } = await render(SankeyPlot, {
				props: {
					width: 700,
					height: 460,
					data: PENGUIN_COUNTS_BY_SEX,
					columns: ['species', 'island', 'sex'],
					value: 'count',
					styles: {
						nodes: { width: 40 },
						values: { layout: 'box', fontStyle: { fontSize: 12, rotate } }
					}
				} as never
			});
			const svg = await waitForSvg(container);
			await expect.poll(() => textsOf(svg).some((t) => t.text.startsWith('Male'))).toBe(true);
			await new Promise((resolve) => setTimeout(resolve, 150));
			return textsOf(svg);
		};
		const names = ['Gentoo119', 'Adelie146', 'Biscoe163', 'Female165', 'Male168'];
		// Across a 40px node, a name over its value only fits shrunk or cut.
		const flat = await sankey(0);
		expect(names.every((name) => flat.find((t) => t.text === name)?.size === 12)).toBe(false);
		const turned = await sankey(-90);
		for (const name of names) expect(turned.find((t) => t.text === name)?.size).toBe(12);
	});

	test("of a plot kind's own labels: a treemap's tiles", async () => {
		const treemap = async (rotate: number) => {
			const { container } = await render(TreemapPlot, {
				props: {
					width: 400,
					height: 400,
					data: [
						{ group: 'Tall', value: 1 },
						{ group: 'Wide', value: 9 }
					],
					value: 'value',
					grouping: 'group',
					styles: { values: { fontStyle: { fontSize: 12, rotate } } }
				} as never
			});
			const svg = await waitForSvg(container);
			await expect.poll(() => textsOf(svg).some((t) => t.text.startsWith('Wide'))).toBe(true);
			await new Promise((resolve) => setTimeout(resolve, 150));
			return textsOf(svg).find((t) => t.text.startsWith('Tall'));
		};
		// The small tile is a narrow strip beside the big one: its name over its share only fits along it.
		expect((await treemap(0))?.size ?? 0).toBeLessThan(12);
		expect((await treemap(-90))?.size).toBe(12);
	});
});
