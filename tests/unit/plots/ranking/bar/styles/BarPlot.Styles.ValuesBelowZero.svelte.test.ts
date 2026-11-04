import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import type { ValueAnchor } from '$lib/types/plots/constants';
import { waitForSvg } from '../../../_helpers/svg';

const DATA = [
	{ cat: 'down', value: -3 },
	{ cat: 'up', value: 2 }
];

type Box = { left: number; right: number; top: number; bottom: number };
const boxOf = (el: Element): Box => {
	const { left, right, top, bottom } = el.getBoundingClientRect();
	return { left, right, top, bottom };
};

/** The bar and the label of the bar below zero and of the one above it, in the page's own pixels. */
async function layout(horizontal: boolean, anchor: ValueAnchor, fontStyle?: object) {
	const { container } = await render(BarPlot, {
		width: 400,
		height: 300,
		data: DATA,
		...(horizontal ? { x: 'value', y: 'cat' } : { x: 'cat', y: 'value' }),
		styles: { values: { show: true, anchor, ...(fontStyle ? { fontStyle } : {}) } }
	});
	const svg = await waitForSvg(container);
	const bars = Array.from(svg.querySelectorAll('g.bar-x rect, g.bar-y rect'));
	const labels = Array.from(svg.querySelectorAll('g.text text'));
	const bar = (cat: string) => boxOf(bars[DATA.findIndex((d) => d.cat === cat)]);
	const label = (text: string) => labels.find((t) => t.textContent === text)!;
	return {
		down: { bar: bar('down'), label: boxOf(label('-3')), el: label('-3') as SVGTextElement },
		up: { bar: bar('up'), label: boxOf(label('2')), el: label('2') as SVGTextElement }
	};
}

const centre = (box: Box, axis: 'x' | 'y') =>
	axis === 'x' ? (box.left + box.right) / 2 : (box.top + box.bottom) / 2;

describe.each([
	{ name: 'horizontal', horizontal: true },
	{ name: 'vertical', horizontal: false }
])('BarPlot - values on $name bars from and below zero', ({ horizontal }) => {
	const axis = horizontal ? 'x' : 'y';
	/** Where `inner` sits along the value axis within `bar`: 0 at the left (top) end, 1 at the right (bottom) one. */
	const at = (inner: Box, bar: Box) => {
		const [from, to] = horizontal ? [bar.left, bar.right] : [bar.top, bar.bottom];
		return (centre(inner, axis) - from) / (to - from);
	};

	test("'outside' puts each label beyond its bar's tip, the one below zero on the other side", async () => {
		const { down, up } = await layout(horizontal, 'outside');
		if (horizontal) {
			expect(down.label.right).toBeLessThanOrEqual(down.bar.left + 1);
			expect(up.label.left).toBeGreaterThanOrEqual(up.bar.right - 1);
		} else {
			expect(down.label.top).toBeGreaterThanOrEqual(down.bar.bottom - 1);
			expect(up.label.bottom).toBeLessThanOrEqual(up.bar.top + 1);
		}
	});

	test("'start' puts each label inside its bar, at its left (top) end", async () => {
		const { down, up } = await layout(horizontal, 'start');
		for (const { bar, label } of [down, up]) {
			expect(at(label, bar)).toBeGreaterThan(0);
			expect(at(label, bar)).toBeLessThan(0.5);
		}
	});

	test("'middle' centres each label on its bar", async () => {
		const { down, up } = await layout(horizontal, 'middle');
		for (const { bar, label } of [down, up]) {
			expect(Math.abs(centre(label, axis) - centre(bar, axis))).toBeLessThan(3);
		}
	});

	test("'end' puts each label inside its bar, at its right (bottom) end", async () => {
		const { down, up } = await layout(horizontal, 'end');
		for (const { bar, label } of [down, up]) {
			expect(at(label, bar)).toBeGreaterThan(0.5);
			expect(at(label, bar)).toBeLessThan(1);
		}
	});
});

describe('BarPlot - values textAnchor', () => {
	test("the author's own textAnchor stays for the bar below zero too", async () => {
		const { down, up } = await layout(true, 'outside', { textAnchor: 'middle' });
		expect(down.el.style.textAnchor).toBe('middle');
		expect(up.el.style.textAnchor).toBe('middle');
	});
});
