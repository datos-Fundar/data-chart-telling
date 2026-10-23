import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import { ARGENTINA_PROVINCES } from '$datasets/argentina-provinces';
import type { GeoFeature } from '$lib/types/plots/data/geo';

const NORTH = ['Jujuy', 'Salta', 'Tucumán', 'Catamarca', 'Formosa', 'Chaco', 'Misiones'];
const TAGGED = ARGENTINA_PROVINCES.map((f) => ({
	...f,
	properties: { ...f.properties!, zone: NORTH.includes(f.properties!.nombre) ? 'North' : 'Rest' }
})) as GeoFeature<Record<string, unknown>>[];

describe('GeoPlot - facet', () => {
	test('one map per value of a feature field, each drawing only its features', async () => {
		const { container } = await render(GeoPlot, {
			width: 600,
			height: 400,
			data: TAGGED,
			featureId: (f) => String(f.properties?.nombre),
			facet: { by: 'zone', columns: 2 }
		});
		await vi.waitFor(() => {
			const maps = [...container.querySelectorAll('.dct-plot')];
			expect(maps.length).toBe(2);
			const counts = maps.map((m) => m.querySelectorAll('g.geo path').length);
			expect(counts.sort((a, b) => a - b)).toEqual([
				NORTH.length,
				ARGENTINA_PROVINCES.length - NORTH.length
			]);
		});
	});
});
