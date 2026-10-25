import { describe, test, expect } from 'vitest';
import { GeoGeometry } from '$lib/plots/map/geo/GeoGeometry';

// ── splitGeometryParts ──────────────────────────────────────────────────────────

describe('GeoGeometry.parts', () => {
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
		const parts = GeoGeometry.parts(geometry);
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
		expect(GeoGeometry.parts(geometry)).toEqual([
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
		expect(GeoGeometry.parts(geometry)).toHaveLength(3);
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
		expect(GeoGeometry.parts(geometry)).toEqual([geometry]);
	});
});

// ── geometryPartCentroids (regression: same output after the splitGeometryParts refactor) ──

describe('GeoGeometry.partCentroids', () => {
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
		expect(GeoGeometry.partCentroids(geometry)).toEqual([
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
		expect(GeoGeometry.partCentroids(geometry)).toEqual([GeoGeometry.centroid(geometry)]);
	});
});

// ── filterGeometryParts ─────────────────────────────────────────────────────────

describe('GeoGeometry.filterParts', () => {
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
		const result = GeoGeometry.filterParts(twoPartMultiPolygon, () => true);
		expect(result).toBe(twoPartMultiPolygon);
	});

	test('keeping no parts returns null', () => {
		expect(GeoGeometry.filterParts(twoPartMultiPolygon, () => false)).toBeNull();
	});

	test('keeping a subset reconstructs a MultiPolygon with just those parts', () => {
		const result = GeoGeometry.filterParts(twoPartMultiPolygon, (part) => part.centroid[0] > 10);
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
		expect(GeoGeometry.filterParts(geometry, () => true)).toBe(geometry);
		expect(GeoGeometry.filterParts(geometry, () => false)).toBeNull();
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
		const result = GeoGeometry.filterParts(geometry, (part) => part.centroid[0] < 10);
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

describe('GeoGeometry.lonLatBounds', () => {
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
		expect(GeoGeometry.lonLatBounds(geometry)).toEqual([-73, -60, -53, -22]);
	});

	test('returns null for a geometry with no coordinates', () => {
		expect(GeoGeometry.lonLatBounds({ type: 'GeometryCollection', geometries: [] })).toBeNull();
	});
});

describe('GeoGeometry.greatCircle', () => {
	test('runs from one point to the other, `steps + 1` points', () => {
		const arc = GeoGeometry.greatCircle([-58, -34], [139, 35], 10);
		expect(arc).toHaveLength(11);
		expect(arc[0][0]).toBeCloseTo(-58);
		expect(arc[0][1]).toBeCloseTo(-34);
		expect(arc[10][0]).toBeCloseTo(139);
		expect(arc[10][1]).toBeCloseTo(35);
	});

	test('bows toward the pole between two points on a parallel', () => {
		const arc = GeoGeometry.greatCircle([0, 60], [90, 60], 2);
		expect(arc[1][1]).toBeGreaterThan(60);
	});

	test('two equal points are just those points', () => {
		expect(GeoGeometry.greatCircle([10, 10], [10, 10])).toEqual([
			[10, 10],
			[10, 10]
		]);
	});
});

describe('GeoGeometry.parallelPath', () => {
	test('stays on the parallel between two points on it', () => {
		const path = GeoGeometry.parallelPath([-70, -33], [151, -33], 10);
		expect(path).toHaveLength(11);
		for (const [, lat] of path) expect(lat).toBeCloseTo(-33);
	});

	test('goes the short way around the antimeridian', () => {
		const path = GeoGeometry.parallelPath([170, 0], [-170, 10], 2);
		expect(Math.abs(path[1][0])).toBeCloseTo(180);
		expect(path[1][1]).toBeCloseTo(5);
		expect(path[2][0]).toBeCloseTo(-170);
	});
});
