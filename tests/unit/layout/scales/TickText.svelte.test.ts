import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import { waitForSvg } from '../../plots/_helpers/svg';

// Sorts right after `c0`, in second place: where a crowded axis does not write a label.
const LONG = 'c0 a category name that is a lot wider than the room it is given';

/** A hundred categories, short but for a long one: too many for the axis to write them all. */
const rows = (count: number) =>
	Array.from({ length: count }, (_, i) => ({
		name: i === 1 ? LONG : `c${i}`,
		value: 10 + ((i * 7) % 20)
	}));

const props = (maxWidth?: number, count = 100) =>
	({
		width: 400,
		height: 240,
		data: rows(count),
		x: 'value',
		y: 'name',
		scales: { y: { ...(maxWidth === undefined ? {} : { maxWidth }) }, x: { nice: false } }
	}) as never;

/** Where the bars start, from the plot's left edge: the left margin. */
const leftMargin = (svg: SVGElement) => {
	const left = svg.getBoundingClientRect().left;
	const bars = [...svg.querySelectorAll('g.bar-x rect, g.bar-y rect')];
	return Math.min(...bars.map((bar) => bar.getBoundingClientRect().left)) - left;
};

const drawn = (svg: SVGElement) =>
	[...svg.querySelectorAll('text')].map((text) => text.textContent ?? '');

describe('scales.y.maxWidth', () => {
	test('cuts a category label wider than it with an ellipsis, so that it fits', async () => {
		const { container } = await render(BarPlot, props(80, 8));
		const svg = await waitForSvg(container);
		await vi.waitFor(() => expect(drawn(svg).some((text) => text.endsWith('…'))).toBe(true));
		const texts = [...svg.querySelectorAll('text')].filter((text) =>
			(text.textContent ?? '').endsWith('…')
		);
		for (const text of texts) expect(text.getBoundingClientRect().width).toBeLessThanOrEqual(82);
		expect(drawn(svg).some((text) => text.includes(LONG))).toBe(false);
		// The margin holds the labels: none runs past the plot's left edge.
		const edge = svg.getBoundingClientRect().left;
		for (const text of svg.querySelectorAll('text'))
			expect(text.getBoundingClientRect().left).toBeGreaterThanOrEqual(edge - 0.5);
	});

	test('keeps the margin for the widest label, though a crowded axis does not draw it', async () => {
		const free = await render(BarPlot, props());
		const freeSvg = await waitForSvg(free.container);
		await vi.waitFor(() => expect(drawn(freeSvg).length).toBeGreaterThan(5));

		const fixed = await render(BarPlot, props(80));
		const fixedSvg = await waitForSvg(fixed.container);
		await vi.waitFor(() => expect(drawn(fixedSvg).length).toBeGreaterThan(5));
		await new Promise((resolve) => setTimeout(resolve, 300));

		// The long label sits where the crowded axis leaves it out.
		expect(drawn(fixedSvg).some((text) => text.endsWith('…'))).toBe(false);
		// Its room is kept anyway: its cut label, the tick and its gap.
		expect(leftMargin(fixedSvg)).toBeGreaterThanOrEqual(75);
		expect(leftMargin(freeSvg)).toBeLessThan(40);
	});
});
