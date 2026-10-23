import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES } from '$datasets/world-countries';
import { WIND_VECTORS } from '$datasets';
import { waitForSvg } from '../../plots/_helpers/svg';

async function maxVectorDiagonal(range: [number, number]): Promise<number> {
	const { container } = render(GeoPlot, {
		width: 400,
		height: 300,
		data: WORLD_COUNTRIES,
		coordinates: { projection: 'mercator' },
		scales: { length: { range } },
		markers: [
			{
				type: 'vector',
				data: WIND_VECTORS,
				x: 'lon',
				y: 'lat',
				length: 'magnitude',
				rotate: 'direction'
			}
		] satisfies GeoMarkersConfig[]
	});
	const svg = await waitForSvg(container);
	const boxes = Array.from(svg.querySelectorAll('g.vector path')).map((p) =>
		(p as SVGGraphicsElement).getBBox()
	);
	return Math.max(...boxes.map((b) => Math.sqrt(b.width ** 2 + b.height ** 2)));
}

describe('length channel - plot level (Geo), scales.length.range', () => {
	test('a wider configured range renders visibly longer vectors than a narrow one', async () => {
		const narrow = await maxVectorDiagonal([0, 10]);
		const wide = await maxVectorDiagonal([0, 100]);
		expect(wide).toBeGreaterThan(narrow * 2);
	});
});
