import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import Plot from '$lib/plots/generic/Plot.svelte';
import { waitForSvg } from '../_helpers/svg';

const ROWS = [
	{ year: 2020, low: 1, high: 4, region: 'Norte' },
	{ year: 2021, low: 2, high: 6, region: 'Norte' },
	{ year: 2022, low: 1, high: 5, region: 'Norte' }
];

async function draw(props: Record<string, unknown>) {
	const { container } = await render(Plot, { width: 400, height: 300, ...props } as never);
	return waitForSvg(container);
}

const texts = (svg: SVGElement) =>
	[...svg.querySelectorAll('text')].map((t) => t.textContent?.trim());

describe('Plot', () => {
	test('draws only its markers, each with its own rows, and no shapes of its own', async () => {
		const svg = await draw({
			markers: [
				{ type: 'area', data: ROWS, x: 'year', y1: 'low', y2: 'high', styles: { fill: 'purple' } }
			]
		});
		await expect.poll(() => svg.querySelectorAll('path.area').length).toBe(1);
		expect(svg.querySelectorAll('g.dot path, g.lines path, g.bar-y rect').length).toBe(0);
	});

	test("markers without rows or a position take the plot's", async () => {
		const svg = await draw({
			data: ROWS,
			x: 'year',
			y: 'high',
			markers: [{ type: 'dot' }, { type: 'text', text: 'high' }]
		});
		await expect.poll(() => svg.querySelectorAll('g.dot path').length).toBe(3);
		await expect.poll(() => texts(svg)).toEqual(expect.arrayContaining(['4', '6', '5']));
	});

	test("a density without a position of its own takes the plot's", async () => {
		const svg = await draw({
			data: ROWS,
			x: 'year',
			y: 'high',
			markers: [{ type: 'density' }]
		});
		await expect.poll(() => svg.querySelectorAll('g.density path').length).toBeGreaterThan(0);
	});

	test('takes chrome as any plot does', async () => {
		const { container } = await render(Plot, {
			width: 400,
			height: 300,
			title: 'Rainfall',
			markers: [{ type: 'dot', data: ROWS, x: 'year', y: 'high' }]
		} as never);
		await waitForSvg(container);
		expect(container.textContent).toContain('Rainfall');
	});
});
