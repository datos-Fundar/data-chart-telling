import { render } from 'vitest-browser-svelte';
import { describe, expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import SlopePlot from '$lib/plots/evolution/slope/Plot.svelte';
import LollipopPlot from '$lib/plots/ranking/lollipop/Plot.svelte';
import TreemapPlot from '$lib/plots/part-of-a-whole/treemap/Plot.svelte';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { waitForSvg } from '../plots/_helpers/svg';

const middleOf = (el: Element) => {
	const box = el.getBoundingClientRect();
	return { x: (box.left + box.right) / 2, y: (box.top + box.bottom) / 2 };
};

/** Moves the pointer onto `el`, at its middle. */
async function pointAt(svg: SVGElement, el: Element) {
	const at = middleOf(el);
	const box = svg.getBoundingClientRect();
	await userEvent.hover(page.elementLocator(svg), {
		force: true,
		position: { x: at.x - box.left, y: at.y - box.top }
	});
}

describe('the point under the pointer', () => {
	test("a slope's rule sits at the dot nearest the pointer, along the hovered position", async () => {
		const data = [
			{ year: 1991, group: 'a', share: 10 },
			{ year: 2022, group: 'a', share: 30 },
			{ year: 1991, group: 'b', share: 20 },
			{ year: 2022, group: 'b', share: 5 }
		];
		const { container } = await render(SlopePlot, {
			width: 400,
			height: 300,
			data,
			x: 'year',
			y: 'share',
			color: 'group',
			markers: [{ type: 'hover', front: [] }]
		});
		const svg = await waitForSvg(container);
		const dots = () => Array.from(svg.querySelectorAll<SVGPathElement>('g.dot path'));
		await expect.poll(() => dots().length).toBe(4);
		const rule = () => svg.querySelector('g.rule-y line, g.rule-y path');
		// The two dots of the second year, the higher and the lower.
		const right = dots()
			.map((dot) => ({ dot, at: middleOf(dot) }))
			.sort((a, b) => b.at.x - a.at.x)
			.slice(0, 2)
			.sort((a, b) => a.at.y - b.at.y);
		for (const { dot, at } of right) {
			await pointAt(svg, dot);
			await vi.waitFor(() => {
				expect(rule()).toBeTruthy();
				expect(Math.abs(middleOf(rule()!).y - at.y)).toBeLessThan(2);
			});
		}
		await userEvent.unhover(page.elementLocator(svg));
	});

	test("a vertical lollipop's rule follows the pointer from one category's dot to another's", async () => {
		const data = [
			{ c: 'A', v: 10 },
			{ c: 'B', v: 30 }
		];
		const { container } = await render(LollipopPlot, {
			width: 400,
			height: 300,
			data,
			x: 'c',
			y: 'v',
			markers: [{ type: 'hover', front: [] }]
		});
		const svg = await waitForSvg(container);
		const dots = () => Array.from(svg.querySelectorAll<SVGPathElement>('g.dot path'));
		await expect.poll(() => dots().length).toBe(2);
		const rule = () => svg.querySelector('g.rule-y line, g.rule-y path');
		for (const dot of [...dots()]) {
			const at = middleOf(dot);
			await pointAt(svg, dot);
			await vi.waitFor(() => {
				expect(Math.abs(middleOf(rule()!).y - at.y)).toBeLessThan(2);
			});
		}
		await userEvent.unhover(page.elementLocator(svg));
	});
});

describe('a plot whose hover only restyles its shapes', () => {
	const outline = DEFAULT_CONFIG.hover.active;
	const dark = 'rgb(17, 24, 39)';

	test('outlines the hovered tile of a treemap by default', async () => {
		const { container } = await render(TreemapPlot, {
			width: 400,
			height: 300,
			data: [
				{ g: 'a', v: 3 },
				{ g: 'b', v: 1 }
			],
			value: 'v',
			grouping: 'g',
			markers: [{ type: 'hover' }]
		});
		const svg = await waitForSvg(container);
		const tiles = () =>
			Array.from(svg.querySelectorAll<SVGRectElement>('rect')).filter(
				(r) => r.style.fill && r.style.fill !== 'transparent'
			);
		await expect.poll(() => tiles().length).toBe(2);
		expect(tiles().some((t) => getComputedStyle(t).stroke === dark)).toBe(false);
		const hits = Array.from(svg.querySelectorAll<SVGRectElement>('rect')).filter(
			(r) => r.style.fill === 'transparent'
		);
		hits[0].dispatchEvent(new PointerEvent('pointerenter'));
		await vi.waitFor(() => {
			const outlined = tiles().filter((t) => getComputedStyle(t).stroke === dark);
			expect(outlined).toHaveLength(1);
			expect(getComputedStyle(outlined[0]).strokeWidth).toBe(`${outline.strokeWidth}px`);
		});
		hits[0].dispatchEvent(new PointerEvent('pointerleave'));
	});

	test('outlines the hovered cell of a heatmap by default', async () => {
		const { container } = await render(HeatmapPlot, {
			width: 400,
			height: 300,
			data: [
				{ a: 'p', b: 'q', v: 1 },
				{ a: 'r', b: 'q', v: 2 }
			],
			x: 'a',
			y: 'b',
			color: 'v',
			markers: [{ type: 'hover' }]
		});
		const svg = await waitForSvg(container);
		const cells = () => Array.from(svg.querySelectorAll<SVGRectElement>('g.cell rect'));
		await expect.poll(() => cells().length).toBe(2);
		await pointAt(svg, cells()[0]);
		await vi.waitFor(() => {
			expect(cells().filter((c) => getComputedStyle(c).stroke === dark)).toHaveLength(1);
		});
		await userEvent.unhover(page.elementLocator(svg));
	});
});
