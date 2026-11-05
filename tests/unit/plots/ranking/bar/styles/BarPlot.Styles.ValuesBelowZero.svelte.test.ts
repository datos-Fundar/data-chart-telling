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
	// The bars as the page lays them out by category, whatever order their markers draw them in: a label that follows the
	// sign of its value is a marker of its own for the bars above zero and the ones below it.
	const bars = Array.from(svg.querySelectorAll('g.bar-x rect, g.bar-y rect')).sort((a, b) =>
		horizontal
			? a.getBoundingClientRect().top - b.getBoundingClientRect().top
			: a.getBoundingClientRect().left - b.getBoundingClientRect().left
	);
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

	/** The ends of the bar as the page draws them: its left and right on a horizontal one, its top and bottom on a vertical one. */
	const [first, last] = (horizontal ? ['left', 'right'] : ['top', 'bottom']) as [
		ValueAnchor,
		ValueAnchor
	];

	test(
		"'" +
			first +
			"' and '" +
			last +
			"' put each label inside its bar, at that end, whatever the sign",
		async () => {
			for (const [anchor, inFirstHalf] of [
				[first, true],
				[last, false]
			] as const) {
				const { down, up } = await layout(horizontal, anchor);
				for (const { bar, label } of [down, up]) {
					expect(at(label, bar) < 0.5).toBe(inFirstHalf);
					expect(at(label, bar)).toBeGreaterThan(0);
					expect(at(label, bar)).toBeLessThan(1);
				}
			}
		}
	);

	test("'tip' puts each label at the end of its bar away from zero, and 'base' at the end on zero", async () => {
		// The bar above zero runs to the right (up), the one below it to the left (down).
		const upIsLast = horizontal;
		const tip = await layout(horizontal, 'tip');
		expect(at(tip.up.label, tip.up.bar) > 0.5).toBe(upIsLast);
		expect(at(tip.down.label, tip.down.bar) > 0.5).toBe(!upIsLast);
		const base = await layout(horizontal, 'base');
		expect(at(base.up.label, base.up.bar) > 0.5).toBe(!upIsLast);
		expect(at(base.down.label, base.down.bar) > 0.5).toBe(upIsLast);
	});

	test("'middle' centres each label on its bar", async () => {
		const { down, up } = await layout(horizontal, 'middle');
		for (const { bar, label } of [down, up]) {
			expect(Math.abs(centre(label, axis) - centre(bar, axis))).toBeLessThan(3);
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

describe('BarPlot - values in the corner of a bar', () => {
	test("'top-left' puts each label inside its bar, in its top left corner", async () => {
		const { down, up } = await layout(false, 'top-left');
		for (const { bar, label } of [down, up]) {
			expect(label.left).toBeGreaterThanOrEqual(bar.left);
			expect(label.left - bar.left).toBeLessThan((bar.right - bar.left) / 2);
			expect(label.top).toBeGreaterThanOrEqual(bar.top);
			expect(label.top - bar.top).toBeLessThan(12);
		}
	});
});
