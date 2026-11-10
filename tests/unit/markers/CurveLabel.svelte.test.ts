import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import Plot from '$lib/plots/generic/Plot.svelte';
import { waitForSvg } from '../plots/_helpers/svg';

const ROWS = [
	{ year: 2000, value: 2, country: 'Chile' },
	{ year: 2010, value: 5, country: 'Chile' },
	{ year: 2020, value: 4, country: 'Chile' },
	{ year: 2000, value: 6, country: 'Peru' },
	{ year: 2010, value: 3, country: 'Peru' },
	{ year: 2020, value: 7, country: 'Peru' }
];

async function draw(markers: unknown[]) {
	const { container } = await render(Plot, {
		width: 500,
		height: 300,
		scales: { x: { domain: [2000, 2020] }, y: { domain: [0, 8] } },
		markers
	} as never);
	const svg = await waitForSvg(container);
	return { svg };
}

const paths = (svg: SVGElement) => [...svg.querySelectorAll('textPath')];

describe('path labels along curves', () => {
	test('a line writes one label along each of its groups, its text from the group', async () => {
		const { svg } = await draw([
			{
				type: 'line',
				data: ROWS,
				x: 'year',
				y: 'value',
				grouping: 'country',
				label: { layout: 'path', text: 'country', offset: '75%' }
			}
		]);
		await expect.poll(() => paths(svg).length).toBe(2);
		expect(paths(svg).map((p) => p.textContent)).toEqual(['Chile', 'Peru']);
		expect(paths(svg)[0].getAttribute('startOffset')).toBe('75%');
		const href = paths(svg)[0].getAttribute('href')!;
		expect(svg.querySelector(href)?.getAttribute('d')).toMatch(/^M/);
	});

	test('side moves the text above, below or onto the curve', async () => {
		const label = (side: string) => ({ layout: 'path', text: 'country', side });
		const { svg } = await draw([
			{ type: 'line', data: ROWS.slice(0, 3), x: 'year', y: 'value', label: label('below') }
		]);
		await expect.poll(() => paths(svg).length).toBe(1);
		const text = svg.querySelector('text:has(textPath)')!;
		expect(text.getAttribute('dominant-baseline')).toBe('hanging');
		expect(Number(text.getAttribute('dy'))).toBeGreaterThan(0);
	});

	test('an area writes along its top or bottom edge', async () => {
		const { svg } = await draw([
			{
				type: 'area',
				data: ROWS.slice(0, 3),
				x: 'year',
				y1: 0,
				y2: 'value',
				label: [
					{ layout: 'path', text: 'top edge', edge: 'top' },
					{ layout: 'path', text: 'bottom edge', edge: 'bottom', side: 'above' }
				]
			}
		]);
		await expect.poll(() => paths(svg).length).toBe(2);
		const [top, bottom] = paths(svg).map((p) => p.closest('text')!.getBoundingClientRect());
		expect(top.bottom).toBeLessThan(bottom.top);
	});

	test('a dot writes around its rim, over its top', async () => {
		const { svg } = await draw([
			{
				type: 'dot',
				data: ROWS.slice(0, 3),
				x: 'year',
				y: 'value',
				r: 14,
				label: { layout: 'path', text: 'value', styles: { fill: 'black' } }
			}
		]);
		await expect.poll(() => paths(svg).length).toBe(3);
		const dot = svg.querySelector('g.dot path')!.getBoundingClientRect();
		const text = paths(svg)[0].closest('text')!.getBoundingClientRect();
		expect(text.bottom).toBeLessThanOrEqual(dot.top + 2);
	});
});
