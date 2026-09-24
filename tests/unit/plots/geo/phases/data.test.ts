import { describe, test, expect } from 'vitest';
import { buildData } from '$lib/plots/geo/phases/data';
import type { GeoPlotState } from '$lib/types/plots/geo/state';
import type { GeoFeature } from '$lib/types/plots/data/geo';

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Props = { name: string };

function point(id: string, name: string, coords: [number, number]): GeoFeature<Props> {
	return {
		type: 'Feature',
		id,
		properties: { name },
		geometry: { type: 'Point', coordinates: coords }
	} as GeoFeature<Props>;
}

function multiPoly(id: string, name: string): GeoFeature<Props> {
	return {
		type: 'Feature',
		id,
		properties: { name },
		geometry: {
			type: 'MultiPolygon',
			coordinates: [
				[
					[
						[0, 0],
						[2, 0],
						[2, 2],
						[0, 2],
						[0, 0]
					]
				],
				[
					[
						[10, 10],
						[12, 10],
						[12, 12],
						[10, 12],
						[10, 10]
					]
				]
			]
		}
	} as GeoFeature<Props>;
}

function build(overrides: Partial<GeoPlotState<Props>> = {}) {
	const state: GeoPlotState<Props> = {
		rawFeatures: [point('a', 'Alpha', [10, 20])],
		segments: {},
		scales: {},
		authoredMarkers: [],
		width: 400,
		height: 300,
		...overrides
	};
	return buildData(state);
}

describe('buildData – feature id', () => {
	test('defaults to feature.id', () => {
		const result = build();
		expect(result.allFeatures![0].__id).toBe('a');
	});

	test('an explicit featureId accessor wins over the default chain', () => {
		const result = build({ featureId: (f) => (f.properties as Props).name });
		expect(result.allFeatures![0].__id).toBe('Alpha');
	});
});

describe('buildData – centroid tagging', () => {
	test('tags a Point feature with its own coordinates as the centroid', () => {
		const result = build();
		expect(result.allFeatures![0].__cx).toBe(10);
		expect(result.allFeatures![0].__cy).toBe(20);
	});
});

describe('buildData – excludeParts', () => {
	test('allFeatures is unaffected by excludeParts', () => {
		const result = build({
			rawFeatures: [multiPoly('a', 'Alpha')],
			excludeParts: (part) => part.centroid[0] > 5
		});
		expect(result.allFeatures![0].geometry.type).toBe('MultiPolygon');
	});

	test('features drops the excluded part, re-centering on what remains', () => {
		const result = build({
			rawFeatures: [multiPoly('a', 'Alpha')],
			excludeParts: (part) => part.centroid[0] > 5
		});
		// Still a MultiPolygon (filterGeometryParts only collapses to the bare
		// part type when exactly one part existed to begin with) — but its
		// coordinates now hold only the kept polygon, and the centroid re-fits.
		expect(result.features![0].geometry.type).toBe('MultiPolygon');
		expect(result.features![0].__cx).toBe(1);
	});

	test('a feature reduced to no parts at all is dropped entirely', () => {
		const result = build({
			rawFeatures: [multiPoly('a', 'Alpha')],
			excludeParts: () => true
		});
		expect(result.features).toHaveLength(0);
	});
});
