import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ViolinPlot from '$lib/plots/distribution/violin/Plot.svelte';
import { ViolinProfiles } from '$lib/markers/violin/ViolinProfiles';
import { waitForSvg } from '../../_helpers/svg';

const rows = Array.from({ length: 60 }, (_, i) => ({
	category: ['a', 'b', 'c'][i % 3],
	value: 10 + ((i * 7) % 23) + (i % 3) * 5,
	group: i % 2 === 0 ? 'F' : 'M'
}));

const base = { width: 500, height: 300, data: rows, x: 'category', y: 'value' };

const BARS = 'g.bar-y rect, g.bar-x rect';

const shapes = (svg: SVGElement) => Array.from(svg.querySelectorAll('.dct-violin > path'));

describe('ViolinPlot', () => {
	test('draws one violin per category', async () => {
		const { container } = render(ViolinPlot, base);
		const svg = await waitForSvg(container);
		expect(shapes(svg)).toHaveLength(3);
	});

	test('a violin is mirrored around the middle of its band', async () => {
		const { container } = render(ViolinPlot, base);
		const svg = await waitForSvg(container);
		const [first] = shapes(svg);
		const box = first.getBoundingClientRect();
		const bar = svg.querySelector(BARS)!.getBoundingClientRect();
		expect(Math.abs(box.left + box.width / 2 - (bar.left + bar.width / 2))).toBeLessThan(1);
	});

	test('`styles.box: false` leaves the inner box out', async () => {
		const { container } = render(ViolinPlot, { ...base, styles: { box: false } });
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll(BARS)).toHaveLength(0);
	});

	test('series share each category band side by side', async () => {
		const { container } = render(ViolinPlot, { ...base, grouping: 'group' });
		const svg = await waitForSvg(container);
		const drawn = shapes(svg);
		expect(drawn).toHaveLength(6);
		const [a, b] = [drawn[0], drawn[3]].map((p) => p.getBoundingClientRect());
		expect(a.right).toBeLessThanOrEqual(b.left + 1);
		// Each series' box sits in its own share of the band, under its violin.
		const bars = Array.from(svg.querySelectorAll(BARS)).map((r) => r.getBoundingClientRect());
		const [first, second] = [bars[0], bars[bars.length - 1]];
		expect(first.right).toBeLessThanOrEqual(second.left);
		const center = (r: DOMRect) => r.left + r.width / 2;
		expect(Math.abs(center(first) - (a.left + a.width / 2))).toBeLessThan(1);
	});

	test('a plot given the category on `y` draws horizontal violins', async () => {
		const { container } = render(ViolinPlot, { ...base, x: 'value', y: 'category' });
		const svg = await waitForSvg(container);
		const [first] = shapes(svg);
		const box = first.getBoundingClientRect();
		expect(box.width).toBeGreaterThan(box.height);
	});
});

describe('ViolinProfiles', () => {
	const read = {
		category: (r: Record<string, unknown>) => r.c,
		value: (r: Record<string, unknown>) => r.v
	};
	const data = [1, 2, 3, 4, 5, 6, 7, 8].map((v) => ({ c: v < 5 ? 'a' : 'b', v }));

	test('one profile per category', () => {
		const profiles = ViolinProfiles.of(data, read);
		expect(profiles.map((p) => p.category)).toEqual(['a', 'b']);
	});

	test('trimmed curves stay within the values extent', () => {
		const [a] = ViolinProfiles.of(data, read, { trim: true });
		const values = a.curve.map((p) => p.value);
		expect(Math.min(...values)).toBeGreaterThanOrEqual(1);
		expect(Math.max(...values)).toBeLessThanOrEqual(4);
	});

	test('a category without enough values draws no violin', () => {
		expect(ViolinProfiles.of([{ c: 'a', v: 1 }], read)).toEqual([]);
	});
});
