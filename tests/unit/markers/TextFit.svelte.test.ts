import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { FEMALE_LIFE } from '$datasets';
import { waitForSvg } from '../plots/_helpers/svg';

const SERIES = [{ name: 'female', x: 'year' as const, y: 'value' as const, data: FEMALE_LIFE }];

/** Boxes of three sizes, each a row with the box it spans and the middle of it. */
const box = (name: string, from: number, to: number, lo: number, hi: number) => ({
	name,
	value: 42,
	from,
	to,
	lo,
	hi,
	at: (from + to) / 2,
	mid: (lo + hi) / 2
});
const ROWS = [
	box('Wholesale trade', 1950, 2010, 60, 80),
	box('Tiny', 1950, 1951, 60, 61),
	box('Narrow box', 1960, 1964, 60, 80)
];

const fitted = (fit: Record<string, unknown>) =>
	({
		type: 'text',
		data: ROWS,
		x: 'at',
		y: 'mid',
		text: 'name',
		styles: { fontSize: 14, fill: 'tomato' },
		fit: { x1: 'from', x2: 'to', y1: 'lo', y2: 'hi', ...fit }
	}) as AxisBasedMarkersConfig;

async function labels(marker: AxisBasedMarkersConfig) {
	const { container } = await render(LinePlot, {
		width: 700,
		height: 400,
		series: SERIES,
		markers: [marker]
	});
	const svg = await waitForSvg(container);
	const own = () =>
		[...svg.querySelectorAll<SVGTextElement>('text')].filter((t) => t.style.fill === 'tomato');
	await expect.poll(() => own().length).toBeGreaterThan(0);
	return own().map((t) => ({
		text: (t.textContent ?? '').replace(/\s+/g, ' ').trim(),
		size: parseFloat(t.style.fontSize)
	}));
}

describe('text marker - fit', () => {
	test('writes a label that fits its box at the size it has, and leaves out one with no room', async () => {
		const all = await labels(fitted({}));
		expect(all.find((l) => l.text === 'Wholesale trade')?.size).toBe(14);
		expect(all.some((l) => l.text.startsWith('Tiny'))).toBe(false);
	});

	test('cuts a label short, or writes its fallback, in a box too narrow for it', async () => {
		const all = await labels(fitted({ fallback: (d: { value: number }) => d.value }));
		expect(all.some((l) => l.text === '42')).toBe(true);
		expect(all.some((l) => l.text === 'Narrow box')).toBe(false);
	});

	test('reads a fallback that names a field of the rows off each row', async () => {
		const all = await labels(fitted({ fallback: 'value' }));
		expect(all.some((l) => l.text === '42')).toBe(true);
	});

	test('does not touch a label with no fit', async () => {
		const all = await labels({ ...fitted({}), fit: undefined } as AxisBasedMarkersConfig);
		expect(all.map((l) => l.text)).toEqual(expect.arrayContaining(ROWS.map((r) => r.name)));
	});
});
