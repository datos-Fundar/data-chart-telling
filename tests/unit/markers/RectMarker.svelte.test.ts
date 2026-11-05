import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { FEMALE_LIFE } from '$datasets';
import { waitForSvg } from '../plots/_helpers/svg';

const SERIES = [{ name: 'female', x: 'year' as const, y: 'value' as const, data: FEMALE_LIFE }];

/** One tomato rectangle over the plot, carrying a row of its own. */
const ROW = { year: 1950, value: 70, from: 1990, to: 2010, lo: 60, hi: 80 };
const rect = (extra: Partial<AxisBasedMarkersConfig> = {}) =>
	({
		type: 'rect',
		data: [ROW],
		x1: 'from',
		x2: 'to',
		y1: 'lo',
		y2: 'hi',
		styles: { fill: 'tomato' },
		...extra
	}) as AxisBasedMarkersConfig;

/** The rectangle the marker drew: the one in tomato. */
const tomato = (svg: SVGElement) =>
	svg.querySelector<SVGElement>('rect[style*="tomato"], path[style*="tomato"]');

async function draw(markers: AxisBasedMarkersConfig[]) {
	const { container } = await render(LinePlot, {
		width: 500,
		height: 320,
		series: SERIES,
		markers
	});
	const svg = await waitForSvg(container);
	await expect.poll(() => tomato(svg)).not.toBeNull();
	return svg;
}

describe('RectMarker - what it passes on to svelteplot', () => {
	test('calls a handler with the event and the row its rectangle draws', async () => {
		const onclick = vi.fn();
		const svg = await draw([rect({ onclick })]);
		tomato(svg)!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(onclick).toHaveBeenCalledTimes(1);
		const [event, row] = onclick.mock.calls[0];
		expect(event).toBeInstanceOf(MouseEvent);
		expect(row).toMatchObject(ROW);
	});

	test('passes every handler it is given', async () => {
		const onpointerenter = vi.fn();
		const onpointerleave = vi.fn();
		const svg = await draw([rect({ onpointerenter, onpointerleave })]);
		tomato(svg)!.dispatchEvent(new PointerEvent('pointerenter'));
		tomato(svg)!.dispatchEvent(new PointerEvent('pointerleave'));
		expect(onpointerenter).toHaveBeenCalledTimes(1);
		expect(onpointerleave).toHaveBeenCalledTimes(1);
	});

	test("rounds a rectangle's corners with styles.borderRadius", async () => {
		const svg = await draw([rect({ styles: { fill: 'tomato', borderRadius: 8 } })]);
		// svelteplot draws a rounded rectangle as a path, and a square one as a rect.
		expect(tomato(svg)?.tagName).toBe('path');
	});

	test('draws a square rectangle without a border radius', async () => {
		const svg = await draw([rect()]);
		expect(tomato(svg)?.tagName).toBe('rect');
	});
});
