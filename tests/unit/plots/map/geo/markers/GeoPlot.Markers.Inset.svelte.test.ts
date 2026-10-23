import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { ARGENTINA_PROVINCES, type ArgentinaProvinceProps } from '$datasets/argentina-provinces';
import { waitForSvg } from '../../../_helpers/svg';

function countInsetPaths(svg: SVGElement): number {
	return svg.querySelectorAll('g.dct-geo-inset path').length;
}

const featureId = (f: { properties: unknown }) => (f.properties as ArgentinaProvinceProps).nombre;

describe('GeoPlot - inset marker', () => {
	test("filters the plot's own data by feature name", async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			featureId,
			markers: [
				{ type: 'inset', location: 'right-middle', features: ['Ciudad Autónoma de Buenos Aires'] }
			] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countInsetPaths(svg)).toBe(1);
	});

	test('features accepts a list, drawing one path per matched feature', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			featureId,
			markers: [
				{
					type: 'inset',
					location: 'right-middle',
					features: ['Ciudad Autónoma de Buenos Aires', 'Córdoba']
				}
			] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countInsetPaths(svg)).toBe(2);
	});

	test('names with no matching feature draw nothing, without crashing', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			featureId,
			markers: [
				{ type: 'inset', location: 'right-middle', features: ['Not A Real Province'] }
			] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countInsetPaths(svg)).toBe(0);
	});

	test("an explicit data prop renders a separate dataset, independent of the plot's own data", async () => {
		const separateFeature = ARGENTINA_PROVINCES[0];
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			featureId,
			markers: [
				{ type: 'inset', location: 'right-middle', data: [separateFeature] }
			] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countInsetPaths(svg)).toBe(1);
	});

	test('data takes precedence over features when both are given', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			featureId,
			markers: [
				{
					type: 'inset',
					location: 'right-middle',
					// `features` would match 2; `data` should win and draw just 1.
					features: ['Ciudad Autónoma de Buenos Aires', 'Córdoba'],
					data: [ARGENTINA_PROVINCES[0]]
				}
			] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countInsetPaths(svg)).toBe(1);
	});

	test('a custom projection/size/margin do not crash', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			featureId,
			markers: [
				{
					type: 'inset',
					location: 'top-left',
					features: ['Tierra del Fuego, Antártida e Islas del Atlántico Sur'],
					projection: { type: 'azimuthal-equidistant', rotate: [49.5, 90] },
					width: 0.4,
					height: 0.3,
					margin: 20,
					styles: { fill: '#dc2626', strokeWidth: 2 }
				}
			] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countInsetPaths(svg)).toBe(1);
	});

	test('featurePartsFilter narrows a matched feature down to just the parts that pass it', async () => {
		const tdf = 'Tierra del Fuego, Antártida e Islas del Atlántico Sur';
		const isAntarcticPart = (part: { centroid: [number, number] }) =>
			part.centroid[1] < -60 || part.centroid[0] > -50;

		const unfiltered = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			featureId,
			markers: [
				{ type: 'inset', location: 'bottom-right', features: [tdf] }
			] satisfies GeoMarkersConfig[]
		});
		const unfilteredSvg = await waitForSvg(unfiltered.container);
		const unfilteredCount = countInsetPaths(unfilteredSvg);

		const filtered = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			featureId,
			markers: [
				{
					type: 'inset',
					location: 'bottom-right',
					features: [tdf],
					featurePartsFilter: (part) => isAntarcticPart(part)
				}
			] satisfies GeoMarkersConfig[]
		});
		const filteredSvg = await waitForSvg(filtered.container);
		const filteredCount = countInsetPaths(filteredSvg);

		// A single <path> per feature either way (the inset renders one <path>
		// per matched feature, not per part) - but the filtered geometry should
		// differ from the unfiltered one, so the rendered `d` attribute changes.
		expect(unfilteredCount).toBe(1);
		expect(filteredCount).toBe(1);
		const unfilteredD = unfilteredSvg.querySelector('g.dct-geo-inset path')?.getAttribute('d');
		const filteredD = filteredSvg.querySelector('g.dct-geo-inset path')?.getAttribute('d');
		expect(filteredD).not.toBe(unfilteredD);
	});

	test('featurePartsFilter receives the matched feature, not just the part', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			featureId,
			markers: [
				{
					type: 'inset',
					location: 'bottom-right',
					features: ['Córdoba', 'Mendoza'],
					featurePartsFilter: (_part, feature) => feature.__id === 'Córdoba'
				}
			] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		// Mendoza is matched by `features` but every one of its parts is
		// rejected by the predicate (since it isn't Córdoba), so only Córdoba
		// ends up rendering.
		expect(countInsetPaths(svg)).toBe(1);
	});

	test('multiple inset markers coexist', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			featureId,
			markers: [
				{ type: 'inset', location: 'top-left', features: ['Córdoba'] },
				{ type: 'inset', location: 'bottom-right', features: ['Mendoza'] }
			] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countInsetPaths(svg)).toBe(2);
	});
});
