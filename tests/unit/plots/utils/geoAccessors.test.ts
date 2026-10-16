import { describe, test, expect } from 'vitest';
import {
	geometryCentroid,
	geometryLonLatBounds,
	geometryPartCentroids,
	splitGeometryParts,
	filterGeometryParts
} from '$lib/plots/utils/geoAccessors';

// ── splitGeometryParts ──────────────────────────────────────────────────────────

describe('splitGeometryParts', () => {
	test('a MultiPolygon splits into one Polygon per element', () => {
		const geometry: GeoJSON.Geometry = {
			type: 'MultiPolygon',
			coordinates: [
				[
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 0]
					]
				],
				[
					[
						[10, 10],
						[11, 10],
						[11, 11],
						[10, 10]
					]
				]
			]
		};
		const parts = splitGeometryParts(geometry);
		expect(parts).toEqual([
			{
				type: 'Polygon',
				coordinates: [
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 0]
					]
				]
			},
			{
				type: 'Polygon',
				coordinates: [
					[
						[10, 10],
						[11, 10],
						[11, 11],
						[10, 10]
					]
				]
			}
		]);
	});

	test('a MultiLineString splits into one LineString per element', () => {
		const geometry: GeoJSON.Geometry = {
			type: 'MultiLineString',
			coordinates: [
				[
					[0, 0],
					[1, 1]
				],
				[
					[5, 5],
					[6, 6]
				]
			]
		};
		expect(splitGeometryParts(geometry)).toEqual([
			{
				type: 'LineString',
				coordinates: [
					[0, 0],
					[1, 1]
				]
			},
			{
				type: 'LineString',
				coordinates: [
					[5, 5],
					[6, 6]
				]
			}
		]);
	});

	test('a GeometryCollection recurses and flattens', () => {
		const geometry: GeoJSON.Geometry = {
			type: 'GeometryCollection',
			geometries: [
				{ type: 'Point', coordinates: [0, 0] },
				{
					type: 'MultiPolygon',
					coordinates: [
						[
							[
								[0, 0],
								[1, 0],
								[1, 1],
								[0, 0]
							]
						],
						[
							[
								[10, 10],
								[11, 10],
								[11, 11],
								[10, 10]
							]
						]
					]
				}
			]
		};
		expect(splitGeometryParts(geometry)).toHaveLength(3);
	});

	test('a single-part geometry returns itself, unchanged', () => {
		const geometry: GeoJSON.Geometry = {
			type: 'Polygon',
			coordinates: [
				[
					[0, 0],
					[1, 0],
					[1, 1],
					[0, 0]
				]
			]
		};
		expect(splitGeometryParts(geometry)).toEqual([geometry]);
	});
});

// ── geometryPartCentroids (regression: same output after the splitGeometryParts refactor) ──

describe('geometryPartCentroids', () => {
	test('one centroid per MultiPolygon part', () => {
		const geometry: GeoJSON.Geometry = {
			type: 'MultiPolygon',
			coordinates: [
				[
					[
						[0, 0],
						[2, 0],
						[2, 2],
						[0, 0]
					]
				],
				[
					[
						[10, 10],
						[20, 10],
						[20, 20],
						[10, 10]
					]
				]
			]
		};
		expect(geometryPartCentroids(geometry)).toEqual([
			[1, 1],
			[15, 15]
		]);
	});

	test('a single-part geometry returns one centroid, same as geometryCentroid', () => {
		const geometry: GeoJSON.Geometry = {
			type: 'Polygon',
			coordinates: [
				[
					[0, 0],
					[2, 0],
					[2, 2],
					[0, 0]
				]
			]
		};
		expect(geometryPartCentroids(geometry)).toEqual([geometryCentroid(geometry)]);
	});
});

// ── filterGeometryParts ─────────────────────────────────────────────────────────

describe('filterGeometryParts', () => {
	const twoPartMultiPolygon: GeoJSON.Geometry = {
		type: 'MultiPolygon',
		coordinates: [
			[
				[
					[0, 0],
					[2, 0],
					[2, 2],
					[0, 0]
				]
			], // centroid ~[1, 1]
			[
				[
					[10, 10],
					[20, 10],
					[20, 20],
					[10, 10]
				]
			] // centroid ~[15, 15]
		]
	};

	test('keeping every part returns the original geometry reference', () => {
		const result = filterGeometryParts(twoPartMultiPolygon, () => true);
		expect(result).toBe(twoPartMultiPolygon);
	});

	test('keeping no parts returns null', () => {
		expect(filterGeometryParts(twoPartMultiPolygon, () => false)).toBeNull();
	});

	test('keeping a subset reconstructs a MultiPolygon with just those parts', () => {
		const result = filterGeometryParts(twoPartMultiPolygon, (part) => part.centroid[0] > 10);
		expect(result).toEqual({
			type: 'MultiPolygon',
			coordinates: [
				[
					[
						[10, 10],
						[20, 10],
						[20, 20],
						[10, 10]
					]
				]
			]
		});
	});

	test('a single-part geometry is kept or dropped as a whole', () => {
		const geometry: GeoJSON.Geometry = {
			type: 'Polygon',
			coordinates: [
				[
					[0, 0],
					[2, 0],
					[2, 2],
					[0, 0]
				]
			]
		};
		expect(filterGeometryParts(geometry, () => true)).toBe(geometry);
		expect(filterGeometryParts(geometry, () => false)).toBeNull();
	});

	test('MultiLineString parts filter the same way', () => {
		const geometry: GeoJSON.Geometry = {
			type: 'MultiLineString',
			coordinates: [
				[
					[0, 0],
					[2, 0]
				], // centroid [1, 0]
				[
					[10, 10],
					[20, 10]
				] // centroid [15, 10]
			]
		};
		const result = filterGeometryParts(geometry, (part) => part.centroid[0] < 10);
		expect(result).toEqual({
			type: 'MultiLineString',
			coordinates: [
				[
					[0, 0],
					[2, 0]
				]
			]
		});
	});
});

// ── geometryLonLatBounds ──────────────────────────────────────────────────────

describe('geometryLonLatBounds', () => {
	test('returns [minLon, minLat, maxLon, maxLat] across every coordinate', () => {
		const geometry: GeoJSON.Geometry = {
			type: 'MultiPolygon',
			coordinates: [
				[
					[
						[-73, -22],
						[-53, -22],
						[-53, -55],
						[-73, -55],
						[-73, -22]
					]
				],
				[
					[
						[-70, -50],
						[-60, -50],
						[-60, -60],
						[-70, -60],
						[-70, -50]
					]
				]
			]
		};
		expect(geometryLonLatBounds(geometry)).toEqual([-73, -60, -53, -22]);
	});

	test('returns null for a geometry with no coordinates', () => {
		expect(geometryLonLatBounds({ type: 'GeometryCollection', geometries: [] })).toBeNull();
	});
});
