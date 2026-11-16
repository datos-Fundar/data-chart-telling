import { render } from 'vitest-browser-svelte';
import { describe, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import SankeyPlot from '$lib/plots/flow/sankey/Plot.svelte';
import { PENGUIN_COUNTS_BY_SEX } from '$datasets';
import { countBarRects, waitForSvg } from '../../_helpers/svg';
import { RowContext } from '$lib/phases/context/RowContext';
import type { SankeyRowContext } from '$lib/types/plots/flow/sankey/props';

/** The penguins by species, island and sex: a table and the columns the plot makes a graph of. */
const BY_ISLAND = {
	data: PENGUIN_COUNTS_BY_SEX,
	columns: ['species', 'island', 'sex'],
	value: 'count'
};

/** The ribbons drawn, not the transparent ones the hover finds them by. */
const ribbons = (svg: SVGElement) =>
	Array.from(svg.querySelectorAll('g.ribbon path')).filter(
		(path) => path.getAttribute('fill') !== 'transparent'
	);

describe('SankeyPlot', () => {
	test('draws a bar per node and a ribbon per link that carries something', async () => {
		const { container } = await render(SankeyPlot, {
			props: { width: 700, height: 400, ...BY_ISLAND }
		});
		const svg = await waitForSvg(container);
		// 3 species, 3 islands, 2 sexes; 5 species-island pairs have penguins, and every island has both sexes.
		await expect.poll(() => ribbons(svg).length).toBe(11);
		expect(countBarRects(svg)).toBeGreaterThanOrEqual(8);
	});

	test('lists every node label on the legend, and labels each node', async () => {
		const { container } = await render(SankeyPlot, {
			props: { width: 700, height: 400, ...BY_ISLAND }
		});
		await waitForSvg(container);
		await expect.poll(() => container.textContent).toContain('Torgersen 47');
		for (const label of ['Adelie', 'Chinstrap', 'Gentoo', 'Biscoe', 'Dream', 'Female', 'Male']) {
			expect(container.textContent).toContain(label);
		}
	});

	test('takes a table and its columns, and keeps the links of each grouping value apart', async () => {
		const { container } = await render(SankeyPlot, {
			props: {
				width: 700,
				height: 400,
				data: PENGUIN_COUNTS_BY_SEX,
				columns: ['species', 'island'],
				value: 'count',
				grouping: 'sex'
			}
		});
		const svg = await waitForSvg(container);
		// 5 species-island pairs, each with its females and its males.
		await expect.poll(() => ribbons(svg).length).toBe(10);
		expect(new Set(ribbons(svg).map((path) => path.getAttribute('fill'))).size).toBe(3);
	});

	test('a text marker of the author reads where each link starts', async () => {
		const { container } = await render(SankeyPlot, {
			props: {
				width: 700,
				height: 400,
				data: PENGUIN_COUNTS_BY_SEX,
				columns: ['species', 'island'],
				value: 'count',
				markers: [
					{
						type: 'text',
						transforms: [
							{
								type: 'filter',
								filter: (row) => RowContext.of<SankeyRowContext>(row).kind === 'link'
							}
						],
						x: (row) => RowContext.of<SankeyRowContext>(row).start!.column,
						y: (row) => RowContext.of<SankeyRowContext>(row).start!.y,
						text: (row) => `${Math.round(RowContext.of<SankeyRowContext>(row).sourceShare!)}%`
					}
				]
			}
		});
		await waitForSvg(container);
		// 44 of the 146 Adelies live on Biscoe.
		await expect.poll(() => container.textContent).toContain('30%');
	});

	test('with a value of the links as its color, colors the links by it', async () => {
		const { container } = await render(SankeyPlot, {
			props: {
				width: 700,
				height: 400,
				data: PENGUIN_COUNTS_BY_SEX,
				columns: ['species', 'island'],
				value: 'count',
				color: 'sex'
			}
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => ribbons(svg).length).toBe(10);
		expect(new Set(ribbons(svg).map((path) => path.getAttribute('fill'))).size).toBe(2);
	});
});

describe('SankeyPlot - hovering', () => {
	/** The invisible shapes the pointer finds the nodes (rects) and links (paths) by. */
	const hitAreas = (svg: SVGElement, tag: string) =>
		Array.from(svg.querySelectorAll<SVGElement>(tag)).filter(
			(el) => el.style.fill === 'transparent' || el.getAttribute('fill') === 'transparent'
		);

	test('a link names its ends and its value in the tooltip, and stands out', async () => {
		const { container } = await render(SankeyPlot, {
			props: { width: 700, height: 400, ...BY_ISLAND, tooltip: true, markers: [{ type: 'hover' }] }
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => hitAreas(svg, 'path').length).toBe(11);
		const opacities = () => ribbons(svg).map((path) => Number(path.getAttribute('fill-opacity')));
		const before = opacities();
		await userEvent.hover(page.elementLocator(hitAreas(svg, 'path')[0]), { force: true });
		await expect.poll(() => container.querySelector('.dct-tooltip')?.textContent).toMatch(/ - /);
		await expect.poll(() => opacities().filter((o, i) => o > before[i]).length).toBe(1);
	});

	test('a node lights up every link it is an end of', async () => {
		const { container } = await render(SankeyPlot, {
			props: { width: 700, height: 400, ...BY_ISLAND, tooltip: true, markers: [{ type: 'hover' }] }
		});
		const svg = await waitForSvg(container);
		// The nodes' own, as wide as a node: not the plot's.
		const nodes = () =>
			hitAreas(svg, 'rect').filter((rect) => rect.getBoundingClientRect().width < 20);
		await expect.poll(() => nodes().length).toBe(8);
		const opacities = () => ribbons(svg).map((path) => Number(path.getAttribute('fill-opacity')));
		const before = opacities();
		// The nodes in the order the arrangement drew them: the species first, Biscoe among the islands.
		const biscoe = nodes()[3];
		await userEvent.hover(page.elementLocator(biscoe), { force: true });
		await expect
			.poll(() => container.querySelector('.dct-tooltip')?.textContent)
			.toContain('Biscoe');
		// Gentoo and Adelie reach it; its females and males leave it.
		await expect.poll(() => opacities().filter((o, i) => o > before[i]).length).toBe(4);
	});
});
