import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import { WORLD_COUNTRIES } from '$datasets/world-countries';
import { waitForSvg } from '../plots/_helpers/svg';

const POINTS = [
	{ x: 1, y: 1, side: -1 },
	{ x: 1, y: 1, side: 1 }
];
const FRAME = { width: 400, height: 300, data: POINTS, x: 'x', y: 'y' } as const;

/** An element's center, from its plot's own corner, so two plots rendered one after the other compare. */
const at = (el: Element) => {
	const svg = (el as SVGGraphicsElement).ownerSVGElement!;
	const box = el.getBoundingClientRect();
	const origin = svg.getBoundingClientRect();
	return { x: box.x + box.width / 2 - origin.x, y: box.y + box.height / 2 - origin.y };
};

/** Where each dot marker's dots are, in document order. */
async function dotsOf(plot: typeof ScatterPlot, props: { markers: Record<string, unknown>[] }) {
	const { container } = await render(plot as never, props as never);
	const svg = await waitForSvg(container);
	// The plot draws its own rows first: the marker's are the last ones.
	return [...svg.querySelectorAll('g.dot path')]
		.slice(-(props.markers[0].data as unknown[]).length)
		.map(at);
}

describe('marker dx/dy', () => {
	test('a number moves a dot marker as a whole', async () => {
		const [still] = await dotsOf(ScatterPlot, {
			...FRAME,
			markers: [{ type: 'dot', data: POINTS.slice(0, 1), x: 'x', y: 'y' }]
		});
		const [moved] = await dotsOf(ScatterPlot, {
			...FRAME,
			markers: [{ type: 'dot', data: POINTS.slice(0, 1), x: 'x', y: 'y', dx: 12, dy: -7 }]
		});
		expect(moved.x - still.x).toBeCloseTo(12, 0);
		expect(moved.y - still.y).toBeCloseTo(-7, 0);
	});

	test('a number moves any marker kind: a line', async () => {
		const rows = [
			{ year: 1, value: 1 },
			{ year: 2, value: 3 }
		];
		const frame = { width: 400, height: 300, data: rows, x: 'year', y: 'value' };
		const pathTop = async (offset: object) => {
			const { container } = await render(LinePlot, {
				...frame,
				markers: [{ type: 'line', data: rows, x: 'year', y: 'value', ...offset }]
			} as never);
			const svg = await waitForSvg(container);
			const marker = [...svg.querySelectorAll('g.lines path')].at(-1)!;
			return at(marker).y;
		};
		expect((await pathTop({ dy: 20 })) - (await pathTop({}))).toBeCloseTo(20, 0);
	});

	test('a function moves each row on its own', async () => {
		const [above, below] = await dotsOf(ScatterPlot, {
			...FRAME,
			markers: [
				{
					type: 'dot',
					data: POINTS,
					x: 'x',
					y: 'y',
					dy: (row: { side: number }) => row.side * 15
				}
			]
		});
		expect(below.y - above.y).toBeCloseTo(30, 0);
		expect(below.x).toBeCloseTo(above.x, 0);
	});

	test('a number and a function together are each applied once', async () => {
		const [still] = await dotsOf(ScatterPlot, {
			...FRAME,
			markers: [{ type: 'dot', data: POINTS.slice(0, 1), x: 'x', y: 'y' }]
		});
		const [moved] = await dotsOf(ScatterPlot, {
			...FRAME,
			markers: [{ type: 'dot', data: POINTS.slice(0, 1), x: 'x', y: 'y', dx: 10, dy: () => 6 }]
		});
		expect(moved.x - still.x).toBeCloseTo(10, 0);
		expect(moved.y - still.y).toBeCloseTo(6, 0);
	});

	test('a text marker still moves by exactly its dx', async () => {
		const textAt = async (dx: number) => {
			const { container } = await render(ScatterPlot, {
				...FRAME,
				markers: [{ type: 'text', data: POINTS.slice(0, 1), x: 'x', y: 'y', text: 'label', dx }]
			} as never);
			const svg = await waitForSvg(container);
			return at(svg.querySelector('g.text text')!).x;
		};
		expect((await textAt(9)) - (await textAt(0))).toBeCloseTo(9, 0);
	});

	test('a function moves each text label, also one that places itself', async () => {
		for (const placing of [{}, { edgeAware: true }]) {
			const { container } = await render(ScatterPlot, {
				...FRAME,
				markers: [
					{
						type: 'text',
						data: POINTS,
						x: 'x',
						y: 'y',
						text: 'label',
						dy: (row: { side: number }) => row.side * 12,
						...placing
					}
				]
			} as never);
			const svg = await waitForSvg(container);
			const [above, below] = [...svg.querySelectorAll('g.text text')].slice(-2).map(at);
			expect(below.y - above.y).toBeCloseTo(24, 0);
		}
	});

	test('a number moves a dot on a map, where svelteplot ignores it', async () => {
		const dotAt = async (offset: object) => {
			const { container } = await render(GeoPlot, {
				width: 400,
				height: 300,
				data: WORLD_COUNTRIES,
				coordinates: { projection: 'mercator' },
				markers: [{ type: 'dot', data: [{ lon: 0, lat: 0 }], x: 'lon', y: 'lat', ...offset }]
			} as never);
			const svg = await waitForSvg(container);
			return at(svg.querySelector('g.dot path')!);
		};
		const still = await dotAt({});
		const moved = await dotAt({ dx: 14, dy: 5 });
		expect(moved.x - still.x).toBeCloseTo(14, 0);
		expect(moved.y - still.y).toBeCloseTo(5, 0);
	});

	test('a function moves each row on a map', async () => {
		const { container } = await render(GeoPlot, {
			width: 400,
			height: 300,
			data: WORLD_COUNTRIES,
			coordinates: { projection: 'mercator' },
			markers: [
				{
					type: 'dot',
					data: [
						{ lon: 0, lat: 0, side: -1 },
						{ lon: 0, lat: 0, side: 1 }
					],
					x: 'lon',
					y: 'lat',
					dy: (row: { side: number }) => row.side * 10
				}
			]
		} as never);
		const svg = await waitForSvg(container);
		const [above, below] = [...svg.querySelectorAll('g.dot path')].map(at);
		expect(below.y - above.y).toBeCloseTo(20, 0);
	});
});
