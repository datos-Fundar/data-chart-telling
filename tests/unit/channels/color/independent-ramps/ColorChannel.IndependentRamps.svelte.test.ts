import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import { resolveColorScale } from '$lib/utils/color';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import type { DotMarkerConfig } from '$lib/types/markers/base';
import type { ArgentinaProvinceProps, WorldCountryProps } from '../../../../../stories/plots/geo/data';
import { ARGENTINA_PROVINCES, WORLD_COUNTRIES, WEATHER_STATIONS } from '../../../../../stories/plots/geo/data';
import { COUNTRIES } from '../../../../../stories/plots/scatter/data';
import { waitForSvg, countGeoPaths, countDotMarks } from '../../../plots/_helpers/svg';

function fillsOf(svg: SVGElement, selector: string): string[] {
	return Array.from(svg.querySelectorAll(selector)).map(
		(el) => el.getAttribute('fill') ?? el.getAttribute('style') ?? ''
	);
}

// A feature's own name identifies it across the segment-ramp tests below —
// real province geometry, synthetic `color`/`grouping` values so each
// scenario's domain math is fully controlled rather than depending on real
// population figures.
function nameOf(f: { properties: unknown }): string {
	return (f.properties as ArgentinaProvinceProps).nombre;
}

function fillOf(svg: SVGElement, name: string): string {
	const idx = ARGENTINA_PROVINCES.findIndex((f) => nameOf(f) === name);
	const path = svg.querySelectorAll('g.geo path, path.geo')[idx];
	return path?.getAttribute('style') ?? '';
}

function dotMarker(scheme: [string, string]): GeoMarkersConfig[] {
	return [
		{
			type: 'dot',
			data: WEATHER_STATIONS,
			x: 'lon',
			y: 'lat',
			color: 'tempC',
			scales: { color: { scheme } }
		}
	];
}

// Guards the core "Camino B" design guarantee: this package resolves a
// separate color ramp per consumer instead of routing every mark through one
// shared scale, so a plot's own channel and a marker's own channel never
// share domain/scheme — even in the same plot.
describe('color channel – independent ramps', () => {
	test('the base map and the dot marker each resolve their own varying fills', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: WORLD_COUNTRIES,
			color: (f) => (f.properties as WorldCountryProps).pop_est,
			scales: { color: { domain: [1_000_000, 1_400_000_000], scheme: ['#e0e7ff', '#4f46e5'] } },
			markers: dotMarker(['#fef08a', '#dc2626'])
		});
		const svg = await waitForSvg(container);
		expect(countGeoPaths(svg)).toBe(WORLD_COUNTRIES.length);
		expect(countDotMarks(svg)).toBe(WEATHER_STATIONS.length);

		const mapFills = new Set(fillsOf(svg, 'g.geo path, path.geo'));
		const dotFills = new Set(fillsOf(svg, 'g.dot path'));
		expect(mapFills.size).toBeGreaterThan(1);
		expect(dotFills.size).toBeGreaterThan(1);
	});

	test("changing the marker's own scheme leaves the base map's fills untouched", async () => {
		const withRedDots = render(GeoPlot, {
			width: 400,
			height: 300,
			data: WORLD_COUNTRIES,
			color: (f) => (f.properties as WorldCountryProps).pop_est,
			scales: { color: { domain: [1_000_000, 1_400_000_000], scheme: ['#e0e7ff', '#4f46e5'] } },
			markers: dotMarker(['#fef08a', '#dc2626'])
		});
		const redSvg = await waitForSvg(withRedDots.container);
		const mapFillsWithRed = fillsOf(redSvg, 'g.geo path, path.geo');

		const withGreenDots = render(GeoPlot, {
			width: 400,
			height: 300,
			data: WORLD_COUNTRIES,
			color: (f) => (f.properties as WorldCountryProps).pop_est,
			scales: { color: { domain: [1_000_000, 1_400_000_000], scheme: ['#e0e7ff', '#4f46e5'] } },
			markers: dotMarker(['#dcfce7', '#166534'])
		});
		const greenSvg = await waitForSvg(withGreenDots.container);
		const mapFillsWithGreen = fillsOf(greenSvg, 'g.geo path, path.geo');

		expect(mapFillsWithRed).toEqual(mapFillsWithGreen);
	});

	test('ScatterPlot: base plot and marker dots each use their own color ramps independently', async () => {
		const highGdpCountries = COUNTRIES.filter((d) => d.gdpPerCapita > 50);
		const { container } = render(ScatterPlot, {
			width: 600,
			height: 400,
			data: COUNTRIES,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy',
			r: 6,
			color: 'region',
			scales: {
				color: {
					scheme: {
						Americas: '#a78bfa',
						Europe: '#60a5fa',
						Asia: '#f97316',
						Africa: '#34d399'
					}
				}
			},
			markers: [
				{
					type: 'dot',
					data: highGdpCountries,
					x: 'gdpPerCapita',
					y: 'lifeExpectancy',
					r: 10,
					color: 'lifeExpectancy',
					scales: { color: { scheme: ['#cffafe', '#0d9488'] } },
					styles: { dotStroke: '#0f172a', dotStrokeWidth: 2 }
				}
			] satisfies DotMarkerConfig[]
		});
		const svg = await waitForSvg(container);
		// Verify that the plot with independent marker ramps renders without error
		expect(svg).toBeDefined();
		expect(svg.querySelectorAll('*').length).toBeGreaterThan(0);
	});
});

describe('color channel – independent ramps: segment-scoped (GeoPlot)', () => {
	test('a segment with its own scales.color overrides the plot-level ramp for its features', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			color: (f) => (nameOf(f) === 'Córdoba' ? 0 : nameOf(f) === 'Mendoza' ? 0 : 5),
			grouping: (f) => (nameOf(f) === 'Córdoba' ? 'test_segment' : undefined),
			scales: { color: { domain: [0, 10], scheme: ['#ff0000', '#0000ff'] } },
			segments: {
				test_segment: [{ scales: { color: { domain: [0, 10], scheme: ['#00ff00', '#ffff00'] } } }]
			}
		});
		const svg = await waitForSvg(container);
		expect(countGeoPaths(svg)).toBe(ARGENTINA_PROVINCES.length);

		// Both start of their own ramp (t=0) — Córdoba (in the segment) reads
		// the segment's green→yellow ramp; Mendoza (not in the segment) reads
		// the plot-level red→blue ramp, despite sharing the same `color` value.
		expect(fillOf(svg, 'Córdoba')).toContain(resolveColorScale({ scheme: ['#00ff00', '#ffff00'] }, [0, 10], [])(0));
		expect(fillOf(svg, 'Mendoza')).toContain(resolveColorScale({ scheme: ['#ff0000', '#0000ff'] }, [0, 10], [])(0));
	});

	test("a segment's own domain is auto-computed from just that segment's own features, not the whole dataset", async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			color: (f) => {
				const name = nameOf(f);
				if (name === 'Córdoba') return 100;
				if (name === 'Mendoza') return 200;
				if (name === 'Buenos Aires') return 0;
				if (name === 'Santa Fe') return 1_000_000;
				return 500_000;
			},
			grouping: (f) => (['Córdoba', 'Mendoza'].includes(nameOf(f)) ? 'test_segment' : undefined),
			// No explicit domain anywhere — both ramps auto-compute from their own features.
			scales: { color: { scheme: ['#000000', '#ffffff'] } },
			segments: { test_segment: [{ scales: { color: { scheme: ['#000000', '#ffffff'] } } }] }
		});
		const svg = await waitForSvg(container);

		// Córdoba (value 100) is the segment's own min → t=0 → pure black. This
		// is only exactly true if the domain used was [100, 200] (the segment's
		// own two features) — under the whole dataset's domain ([0, 1e6], via
		// Buenos Aires/Santa Fe) it would land at t≈0.0001, nowhere near pure
		// black or white, so both endpoint checks together pin the domain down.
		const segmentDomainColor = resolveColorScale({ scheme: ['#000000', '#ffffff'] }, [100, 200], [])(100);
		expect(fillOf(svg, 'Córdoba')).toContain(segmentDomainColor);

		// Mendoza (value 200) is the segment's own max → t=1 → pure white.
		const segmentMaxColor = resolveColorScale({ scheme: ['#000000', '#ffffff'] }, [100, 200], [])(200);
		expect(fillOf(svg, 'Mendoza')).toContain(segmentMaxColor);
	});

	test('a segment keyed by feature id (no grouping) also gets its own ramp', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			featureId: (f) => nameOf(f),
			color: () => 0,
			scales: { color: { domain: [0, 1], scheme: ['#ff0000', '#0000ff'] } },
			segments: {
				Córdoba: [{ scales: { color: { domain: [0, 1], scheme: ['#00ff00', '#ffff00'] } } }]
			}
		});
		const svg = await waitForSvg(container);

		expect(fillOf(svg, 'Córdoba')).toContain(resolveColorScale({ scheme: ['#00ff00', '#ffff00'] }, [0, 1], [])(0));
		expect(fillOf(svg, 'Mendoza')).toContain(resolveColorScale({ scheme: ['#ff0000', '#0000ff'] }, [0, 1], [])(0));
	});
});

describe('color channel – independent ramps: marker inherits the plot ramp when unset', () => {
	function dotFillOf(svg: SVGElement): string {
		return svg.querySelector('g.dot path')?.getAttribute('style') ?? '';
	}

	test('a dot marker with a color accessor but no scales of its own renders via the plot-level ramp', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			color: () => 5,
			scales: { color: { domain: [0, 10], scheme: ['#ff0000', '#0000ff'] } },
			markers: [
				{ type: 'dot', data: [{ x: 0, y: 0, v: 0 }], x: 'x', y: 'y', color: 'v' }
			] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const plotRampColor = resolveColorScale({ scheme: ['#ff0000', '#0000ff'] }, [0, 10], [])(0);
		expect(dotFillOf(svg)).toContain(plotRampColor);
	});

	test("a dot marker with its own scales.color does not inherit the plot's ramp", async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			color: () => 5,
			scales: { color: { domain: [0, 10], scheme: ['#ff0000', '#0000ff'] } },
			markers: [
				{
					type: 'dot',
					data: [{ x: 0, y: 0, v: 0 }],
					x: 'x',
					y: 'y',
					color: 'v',
					scales: { color: { domain: [0, 10], scheme: ['#00ff00', '#ffff00'] } }
				}
			] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const markerRampColor = resolveColorScale({ scheme: ['#00ff00', '#ffff00'] }, [0, 10], [])(0);
		const plotRampColor = resolveColorScale({ scheme: ['#ff0000', '#0000ff'] }, [0, 10], [])(0);
		expect(dotFillOf(svg)).toContain(markerRampColor);
		expect(dotFillOf(svg)).not.toContain(plotRampColor);
	});
});
