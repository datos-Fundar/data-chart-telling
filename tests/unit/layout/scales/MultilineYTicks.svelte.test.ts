import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import { waitForSvg } from '../../plots/_helpers/svg';

const ROWS = [
	{ category: 'Vivienda y servicios', value: 3 },
	{ category: 'Salud', value: 2 },
	{ category: 'Bebidas alcohólicas y tabaco', value: 1 }
];
const props = {
	width: 500,
	height: 300,
	data: ROWS,
	x: 'value',
	y: 'category',
	legend: false
};
const twoLines = (d: unknown) => {
	const words = String(d).split(' ');
	return words.length < 2
		? [String(d)]
		: [
				words.slice(0, Math.ceil(words.length / 2)).join(' '),
				words.slice(Math.ceil(words.length / 2)).join(' ')
			];
};
const drawn = (container: Element) =>
	[...container.querySelectorAll('.dct-multiline-y-ticks text')].map((label) =>
		[...label.querySelectorAll('tspan')].map((line) => line.textContent?.trim())
	);

describe('A band y axis whose tickFormat gives several lines', () => {
	test('writes each label on its lines', async () => {
		const { container } = await render(BarPlot, {
			...props,
			scales: { y: { tickFormat: twoLines } }
		} as never);
		await waitForSvg(container);
		await vi.waitFor(() => {
			const labels = drawn(container);
			expect(labels).toHaveLength(3);
			expect(labels).toContainEqual(['Vivienda y', 'servicios']);
			expect(labels).toContainEqual(['Salud']);
		});
	});

	test('`lines` splits the labels without a tickFormat of its own', async () => {
		const { container } = await render(BarPlot, {
			...props,
			scales: { y: { lines: 2 } }
		} as never);
		await waitForSvg(container);
		await vi.waitFor(() => {
			const labels = drawn(container);
			expect(labels).toContainEqual(['Vivienda y', 'servicios']);
			expect(labels).toContainEqual(['Bebidas alcohólicas', 'y tabaco']);
		});
	});

	test('`lines` also splits the labels of a vertical bar plot, and keeps them upright', async () => {
		const { container } = await render(BarPlot, {
			...props,
			x: 'category',
			y: 'value',
			scales: { x: { lines: 2 } }
		} as never);
		await waitForSvg(container);
		await vi.waitFor(() => {
			const tspans = [...container.querySelectorAll('g.tick text tspan')].map((t) =>
				t.textContent?.trim()
			);
			expect(tspans).toContain('Vivienda y');
			expect(tspans).toContain('servicios');
		});
		const angles = [...container.querySelectorAll('g.tick text')].map((text) =>
			Number(/rotate\((-?[\d.]+)/.exec(text.getAttribute('transform') ?? '')?.[1] ?? 0)
		);
		expect(angles.length).toBeGreaterThan(0);
		expect(angles.every((angle) => angle === 0)).toBe(true);
	});

	test('leaves the axis alone when every label fits on one line', async () => {
		const { container } = await render(BarPlot, {
			...props,
			scales: { y: { tickFormat: (d: unknown) => String(d) } }
		} as never);
		await waitForSvg(container);
		await new Promise((r) => setTimeout(r, 200));
		expect(drawn(container)).toHaveLength(0);
	});
});
