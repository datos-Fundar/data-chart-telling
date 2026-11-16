import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import Plot from '$lib/plots/generic/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { waitForSvg } from '../plots/_helpers/svg';

const ROW = { from: 2, to: 8, lo: 2, hi: 4, lo2: 6, hi2: 9 };
const ribbon = (extra: Partial<AxisBasedMarkersConfig> = {}) =>
	({
		type: 'ribbon',
		data: [ROW],
		x1: 'from',
		x2: 'to',
		y1: 'lo',
		y2: 'hi',
		y3: 'lo2',
		y4: 'hi2',
		styles: { fill: 'tomato' },
		...extra
	}) as AxisBasedMarkersConfig;

const paths = (svg: SVGElement) => [...svg.querySelectorAll<SVGPathElement>('g.ribbon > path')];

async function draw(markers: AxisBasedMarkersConfig[], scales: object = {}) {
	const { container } = await render(Plot, {
		width: 500,
		height: 320,
		data: [],
		scales: { x: { domain: [0, 10] }, y: { domain: [0, 10] }, ...scales },
		markers
	});
	const svg = await waitForSvg(container);
	await expect.poll(() => paths(svg).length).toBeGreaterThan(0);
	return svg;
}

/** The pixel points a ribbon's path goes through, in the order it draws them. */
const pointsOf = (path: SVGPathElement) =>
	[...path.getAttribute('d')!.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((m) => [+m[1], +m[2]]);

describe('RibbonMarker', () => {
	test('draws a band per row, leaving at x1 between y1 and y2 and arriving at x2 between y3 and y4', async () => {
		const svg = await draw([ribbon()]);
		const [path] = paths(svg);
		expect(path.getAttribute('fill')).toBe('tomato');
		const points = pointsOf(path);
		const [start, , , end] = points;
		expect(end[0]).toBeGreaterThan(start[0]);
		// y grows up: the band arrives higher on screen than it leaves.
		expect(end[1]).toBeLessThan(start[1]);
		const height = (a: number[], b: number[]) => Math.abs(a[1] - b[1]);
		const last = points[points.length - 1];
		expect(height(end, points[4])).toBeCloseTo(1.5 * height(start, last), 0);
	});

	test('keeps the same edges at both ends when y3 and y4 are unset', async () => {
		const svg = await draw([ribbon({ y3: undefined, y4: undefined } as never)]);
		const points = pointsOf(paths(svg)[0]);
		expect(points[0][1]).toBeCloseTo(points[3][1], 6);
	});

	test('on a band axis, joins the far edge of the start band to the near edge of the end band', async () => {
		const svg = await draw([ribbon({ data: [{ ...ROW, from: 'A', to: 'B' }] })], {
			x: { type: 'band', domain: ['A', 'B'], padding: 0.5 }
		});
		const [start, , , end] = pointsOf(paths(svg)[0]);
		// Two bands with half a step of padding each side: A ends and B starts a band's width apart.
		expect(end[0] - start[0]).toBeGreaterThan(0);
		const ribbonWidth = end[0] - start[0];
		const svgWidth = Number(svg.getAttribute('width'));
		expect(ribbonWidth).toBeLessThan(svgWidth / 2);
	});

	test('pulls each end in by insetStart and insetEnd pixels', async () => {
		const plain = pointsOf(paths(await draw([ribbon()]))[0]);
		document.body.innerHTML = '';
		const inset = pointsOf(
			paths(await draw([ribbon({ styles: { fill: 'tomato', insetStart: 5, insetEnd: 7 } })]))[0]
		);
		expect(inset[0][0] - plain[0][0]).toBeCloseTo(5, 3);
		expect(plain[3][0] - inset[3][0]).toBeCloseTo(7, 3);
	});

	test('calls a handler with the event and the row its ribbon draws', async () => {
		const onclick = vi.fn();
		const svg = await draw([ribbon({ onclick })]);
		paths(svg)[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(onclick).toHaveBeenCalledTimes(1);
		expect(onclick.mock.calls[0][1]).toMatchObject(ROW);
	});
});

describe('RibbonMarker - literal channels', () => {
	test('reads a number as the position itself, not as a field', async () => {
		const svg = await draw([
			ribbon({ data: [{}], x1: 1, x2: 9, y1: 4, y2: 6, y3: 1, y4: 9 } as never)
		]);
		expect(paths(svg)).toHaveLength(1);
	});
});

describe('RibbonMarker - color channel', () => {
	const FLOWS = [
		{ ...ROW, flow: 'north' },
		{ ...ROW, lo: 6, hi: 8, flow: 'south' }
	];

	test('colors each ribbon by its value, from the palette', async () => {
		const svg = await draw([ribbon({ data: FLOWS, color: 'flow', styles: {} })]);
		const fills = paths(svg).map((path) => path.getAttribute('fill'));
		expect(new Set(fills).size).toBe(2);
	});

	test('names each value on the legend', async () => {
		const { container } = await render(Plot, {
			width: 500,
			height: 320,
			data: [],
			scales: { x: { domain: [0, 10] }, y: { domain: [0, 10] } },
			markers: [ribbon({ data: FLOWS, color: 'flow', styles: {} })]
		});
		await expect.poll(() => container.textContent).toContain('North');
		expect(container.textContent).toContain('South');
	});
});

describe('RibbonMarker - opacity channel and what it takes from the plot', () => {
	const WEIGHTED = [
		{ ...ROW, flow: 'north', weight: 1 },
		{ ...ROW, lo: 6, hi: 8, flow: 'south', weight: 9 }
	];
	const opacities = (svg: SVGElement) =>
		paths(svg).map((path) => Number(path.getAttribute('fill-opacity')));

	test('fades each ribbon by its value, over its own fill opacity', async () => {
		const svg = await draw([
			ribbon({ data: WEIGHTED, opacity: 'weight', styles: { fillOpacity: 0.5 } })
		]);
		const [light, heavy] = opacities(svg);
		expect(light).toBeLessThan(heavy);
		expect(heavy).not.toBe(0.5);
	});

	test("takes the plot's color and opacity when it sets none of its own", async () => {
		const { container } = await render(Plot, {
			width: 500,
			height: 320,
			data: WEIGHTED,
			color: 'flow',
			opacity: 'weight',
			scales: { x: { domain: [0, 10] }, y: { domain: [0, 10] } },
			markers: [ribbon({ data: undefined, styles: {} } as never)]
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => paths(svg).length).toBe(2);
		expect(new Set(paths(svg).map((path) => path.getAttribute('fill'))).size).toBe(2);
		const [light, heavy] = opacities(svg);
		expect(light).toBeLessThan(heavy);
	});
});

describe('RibbonMarker - transforms', () => {
	test('draws what its transforms leave, moved at both ends', async () => {
		const shifted = pointsOf(
			paths(
				await draw([
					ribbon({
						data: [ROW, { ...ROW, from: 3 }],
						transforms: [
							{ type: 'filter', filter: (row: typeof ROW) => row.from === 2 },
							{ type: 'shiftY', by: { y1: 1, y2: 1 } }
						]
					})
				])
			)[0]
		);
		document.body.innerHTML = '';
		const plain = pointsOf(paths(await draw([ribbon()]))[0]);
		expect(shifted[0][1]).toBeLessThan(plain[0][1]);
		expect(shifted[3][1]).toBeLessThan(plain[3][1]);
		expect(shifted[3][1] - plain[3][1]).toBeCloseTo(shifted[0][1] - plain[0][1], 3);
	});

	test('paints a gradient fill as a linear gradient across each ribbon, or across the plot', async () => {
		const shape = await draw([
			ribbon({ styles: { fill: { gradient: ['red', 'blue'] } } } as never)
		]);
		const id = paths(shape)[0].getAttribute('fill')!.slice('url(#'.length, -1);
		const gradient = shape.querySelector(`linearGradient[id="${id}"]`)!;
		expect(gradient.getAttribute('gradientUnits')).toBe('objectBoundingBox');
		expect(
			[...gradient.querySelectorAll('stop')].map((stop) => stop.getAttribute('offset'))
		).toEqual(['0', '1']);

		const plot = await draw([
			ribbon({
				styles: {
					fill: {
						gradient: [
							{ at: 0, color: 'red' },
							{ at: 5, color: 'blue' }
						]
					}
				}
			} as never)
		]);
		const across = plot.querySelector('linearGradient')!;
		expect(across.getAttribute('gradientUnits')).toBe('userSpaceOnUse');
		const offsets = [...across.querySelectorAll('stop')].map((stop) =>
			Number(stop.getAttribute('offset'))
		);
		expect(offsets[0]).toBeCloseTo(0, 2);
		expect(offsets[1]).toBeCloseTo(0.5, 1);
	});
});
