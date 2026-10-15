import { describe, test, expect } from 'vitest';
import { geoMercator } from 'd3-geo';
import {
	visibleTiles,
	buildMercatorFit,
	tileScreenBounds,
	tileUrl,
	toProjectionLike,
	type ProjectionLike
} from '$lib/plots/utils/tiles';

// A simple linear (equirectangular-like) mock projection: screen pixel
// (px, py) <-> lon/lat via a configurable pixels-per-degree scale - enough
// to exercise `visibleTiles`/`tileScreenBounds`'s math without depending on
// a real `d3-geo` projection.
function makeMockProjection(
	pixelsPerDegree: number,
	width: number,
	height: number
): ProjectionLike {
	const forward = ((point: [number, number]) => {
		const [lon, lat] = point;
		return [width / 2 + lon * pixelsPerDegree, height / 2 - lat * pixelsPerDegree] as [
			number,
			number
		];
	}) as ProjectionLike;
	forward.invert = (point: [number, number]) => {
		const [x, y] = point;
		return [(x - width / 2) / pixelsPerDegree, (height / 2 - y) / pixelsPerDegree];
	};
	return forward;
}

// ── toProjectionLike ──────────────────────────────────────────────────────────

describe('toProjectionLike', () => {
	test('forward-projects a point the same way calling a real d3 projection directly does', () => {
		const projection = geoMercator();
		const adapted = toProjectionLike(projection);
		expect(adapted([-58.4, -34.6])).toEqual(projection([-58.4, -34.6]));
	});

	test('carries through invert()', () => {
		const projection = geoMercator();
		const adapted = toProjectionLike(projection);
		const projected = adapted([10, 20])!;
		expect(adapted.invert!(projected)).toEqual(projection.invert!(projected));
	});

	test('omits invert() when the wrapped projection has none', () => {
		const adapted = toProjectionLike({ stream: (s) => s });
		expect(adapted.invert).toBeUndefined();
	});
});

// ── tileUrl ─────────────────────────────────────────────────────────────────────

describe('tileUrl', () => {
	test('substitutes {z}/{x}/{y} placeholders', () => {
		expect(tileUrl('https://tile.example/{z}/{x}/{y}.png', { x: 3, y: 5, z: 2 })).toBe(
			'https://tile.example/2/3/5.png'
		);
	});

	test('a template with no placeholders is returned unchanged', () => {
		expect(tileUrl('https://tile.example/static.png', { x: 1, y: 1, z: 1 })).toBe(
			'https://tile.example/static.png'
		);
	});

	test('substitutes {-y} as the TMS-flipped row (2^z - 1 - y)', () => {
		expect(tileUrl('https://tile.example/{z}/{x}/{-y}.png', { x: 3, y: 5, z: 3 })).toBe(
			'https://tile.example/3/3/2.png'
		);
	});
});

// ── visibleTiles ──────────────────────────────────────────────────────────────

describe('visibleTiles', () => {
	test('returns an empty array when the projection has no invert()', () => {
		const noInvert = (() => [0, 0]) as ProjectionLike;
		expect(visibleTiles(noInvert, { left: 0, top: 0, width: 400, height: 300 })).toEqual([]);
	});

	test('returns tiles with valid, non-negative x/y indices within the zoom level bounds', () => {
		const projection = makeMockProjection(4, 400, 300);
		const tiles = visibleTiles(
			projection,
			{ left: 0, top: 0, width: 400, height: 300 },
			256,
			0,
			19
		);
		expect(tiles.length).toBeGreaterThan(0);
		for (const t of tiles) {
			const maxIndex = 2 ** t.z - 1;
			expect(t.x).toBeGreaterThanOrEqual(0);
			expect(t.x).toBeLessThanOrEqual(maxIndex);
			expect(t.y).toBeGreaterThanOrEqual(0);
			expect(t.y).toBeLessThanOrEqual(maxIndex);
		}
	});

	test('clamps the zoom level to the given minZoom/maxZoom range', () => {
		const projection = makeMockProjection(400, 4000, 3000); // very zoomed in
		const tiles = visibleTiles(
			projection,
			{ left: 0, top: 0, width: 4000, height: 3000 },
			256,
			0,
			5
		);
		expect(tiles.length).toBeGreaterThan(0);
		for (const t of tiles) expect(t.z).toBeLessThanOrEqual(5);
	});

	test('a wider viewport at the same scale covers at least as many tiles as a narrower one', () => {
		const projection = makeMockProjection(4, 400, 300);
		const narrow = visibleTiles(
			projection,
			{ left: 150, top: 100, width: 20, height: 20 },
			256,
			0,
			19
		);
		const wide = visibleTiles(projection, { left: 0, top: 0, width: 400, height: 300 }, 256, 0, 19);
		expect(wide.length).toBeGreaterThanOrEqual(narrow.length);
	});
});

// ── buildMercatorFit / tileScreenBounds ──────────────────────────────────────────

describe('buildMercatorFit', () => {
	test('returns null when the projection has no invert()', () => {
		const noInvert = (() => [0, 0]) as ProjectionLike;
		expect(buildMercatorFit(noInvert, { left: 0, top: 0, width: 400, height: 300 }, 4)).toBeNull();
	});

	test('returns a usable fit for a real, tightly-fitted mercator projection', () => {
		// Fits to a bbox well away from the poles (a plain rectangle, not
		// `{type:'Sphere'}` - mercator can't represent latitude ±90° at all,
		// the same degenerate case `buildMercatorFit` exists to route around).
		const bounds = { left: 40, top: 20, width: 890, height: 450 };
		// Counter-clockwise winding (RFC 7946's right-hand rule for exterior
		// rings) - d3-geo reads a clockwise ring as covering its complement
		// instead of this small rectangle.
		const domain: GeoJSON.Polygon = {
			type: 'Polygon',
			coordinates: [
				[
					[-74, -21],
					[-53, -21],
					[-53, -55],
					[-74, -55],
					[-74, -21]
				]
			]
		};
		const projection = toProjectionLike(
			geoMercator().fitExtent(
				[
					[bounds.left, bounds.top],
					[bounds.left + bounds.width, bounds.top + bounds.height]
				],
				domain
			)
		);
		const fit = buildMercatorFit(projection, bounds, 4);
		expect(fit).not.toBeNull();
		expect(fit!.pxPerTileX).toBeGreaterThan(0);
		expect(fit!.pxPerTileY).toBeGreaterThan(0);
	});
});

describe('buildMercatorFit / visibleTiles - a tall/narrow domain letterboxed into a wide/short box', () => {
	// A tall, narrow country (Argentina's rough bbox) fit into cells of a
	// facet grid at increasing row counts - a fixed panel width split across
	// more rows leaves each cell much shorter relative to its width, which is
	// exactly the "1x3 looks fine, 2x2/3x2 look broken" symptom reported: the
	// fit's scale is pinned to the constraining (height) axis, so the
	// unconstrained (width) axis' now-large letterboxed margin can imply more
	// of the earth than actually exists once inverted.
	const argentinaBbox: GeoJSON.Polygon = {
		type: 'Polygon',
		coordinates: [
			[
				[-73, -22],
				[-53, -22],
				[-53, -55],
				[-73, -55],
				[-73, -22]
			]
		]
	};

	function fitInto(bounds: { left: number; top: number; width: number; height: number }) {
		return toProjectionLike(
			geoMercator().fitExtent(
				[
					[bounds.left, bounds.top],
					[bounds.left + bounds.width, bounds.top + bounds.height]
				],
				argentinaBbox
			)
		);
	}

	test('a 1-row cell (tall/narrow, aspect ratio close to the data) fits cleanly', () => {
		const bounds = { left: 0, top: 0, width: 392, height: 476 };
		const projection = fitInto(bounds);
		const tiles = visibleTiles(projection, bounds, 256, 0, 19);
		const fit = buildMercatorFit(projection, bounds, tiles[0].z);
		expect(fit).not.toBeNull();
		expect(fit!.pxPerTileX).toBeGreaterThan(0);
		expect(fit!.pxPerTileY).toBeGreaterThan(0);
	});

	// Note: a real slippy-map tile grid *always* has partial tiles hanging past
	// the exact requested viewport edge (tile boundaries rarely land exactly
	// on it) - even the already-fine 1-row case above overshoots its own
	// bounds by tens of pixels per side. So "some overshoot" isn't the bug;
	// what actually broke was `pxPerTileX`/`pxPerTileY` going *negative* (the
	// corners' inverted longitude order got reversed by the antimeridian
	// wrap), which independently of any specific pixel tolerance is simply
	// never a valid tile-space scale.
	test('a 2-row cell (wide/short) no longer produces a negative/inverted scale', () => {
		const bounds = { left: 0, top: 0, width: 594, height: 220 };
		const projection = fitInto(bounds);
		const tiles = visibleTiles(projection, bounds, 256, 0, 19);
		expect(tiles.length).toBeGreaterThan(0);
		const fit = buildMercatorFit(projection, bounds, tiles[0].z);
		expect(fit).not.toBeNull();
		expect(fit!.pxPerTileX).toBeGreaterThan(0);
		expect(fit!.pxPerTileY).toBeGreaterThan(0);
	});

	test('an even wider/shorter cell (3 rows) behaves the same way', () => {
		const bounds = { left: 0, top: 0, width: 392, height: 220 };
		const projection = fitInto(bounds);
		const tiles = visibleTiles(projection, bounds, 256, 0, 19);
		expect(tiles.length).toBeGreaterThan(0);
		const fit = buildMercatorFit(projection, bounds, tiles[0].z);
		expect(fit).not.toBeNull();
		expect(fit!.pxPerTileX).toBeGreaterThan(0);
		expect(fit!.pxPerTileY).toBeGreaterThan(0);
	});

	// Regression: an aspect ratio extreme enough to actually engage
	// `clampBoundsToWorld`'s cap (unlike the more modest cells above, whose
	// letterboxed margin never gets close to it) must still stop *well* short
	// of Argentina's own antipode - Australia - rather than filling the whole
	// box with tiles up to a full world-width, whose two edges would meet
	// exactly there.
	test("an extremely wide/short cell fills with tiles but never reaches the data's own antipodal region", () => {
		// Large enough (at a fine enough zoom level) that tile quantization
		// doesn't itself dominate the measured span - see the zoom-level math in
		// `estimateZoomLevel`'s doc comment for why a *tiny* box like the other
		// cases in this file stays pinned to a very coarse (low-`z`) tile grid.
		const bounds = { left: 0, top: 0, width: 60000, height: 1000 };
		const projection = fitInto(bounds);
		const tiles = visibleTiles(projection, bounds, 256, 0, 19);
		expect(tiles.length).toBeGreaterThan(0);

		const fit = buildMercatorFit(projection, bounds, tiles[0].z);
		expect(fit).not.toBeNull();
		expect(fit!.pxPerTileX).toBeGreaterThan(0);
		expect(fit!.pxPerTileY).toBeGreaterThan(0);

		const z = tiles[0].z;
		const minTileX = Math.min(...tiles.map((t) => t.x));
		const maxTileX = Math.max(...tiles.map((t) => t.x));
		const tileXToLon = (x: number) => (x / 2 ** z) * 360 - 180;
		const lonSpan = tileXToLon(maxTileX + 1) - tileXToLon(minTileX);

		// Comfortably under a full world (360°) - the old cap this replaces -
		// and under even the new 180° cap plus a tile's worth of edge overshoot.
		expect(lonSpan).toBeLessThan(220);

		// Argentina's own longitude sits around -63°; its antipode (~117°E) is
		// deep inside Australia's own span (113°E-153°E). No tile should reach
		// that far around the globe in either direction.
		const australiaTileX = ((117 + 180) / 360) * 2 ** z;
		expect(maxTileX).toBeLessThan(australiaTileX);
	});
});

describe('buildMercatorFit / visibleTiles - dataLonLatBounds caps the tile-layer context', () => {
	// Same rough Argentina bbox as the describe block above, expressed the way
	// `Plot.svelte`'s `dataLonLatBounds` hands it to `TileLayer`.
	const argentinaBbox: GeoJSON.Polygon = {
		type: 'Polygon',
		coordinates: [
			[
				[-73, -22],
				[-53, -22],
				[-53, -55],
				[-73, -55],
				[-73, -22]
			]
		]
	};
	const dataLonLatBounds: [number, number, number, number] = [-73, -55, -53, -22];

	function fitInto(bounds: { left: number; top: number; width: number; height: number }) {
		return toProjectionLike(
			geoMercator().fitExtent(
				[
					[bounds.left, bounds.top],
					[bounds.left + bounds.width, bounds.top + bounds.height]
				],
				argentinaBbox
			)
		);
	}

	// Regression for the follow-up bug: a *small* facet cell (not just a wide
	// one) naturally estimates a very low zoom, where a single 90°+-wide tile
	// still renders in full even past `clampBoundsToWorld`'s half-world cap -
	// dragging in all of Africa (confirmed via the `GeoPlot/Facet` Storybook
	// stories' `Rows2Cols2` at real-world facet-cell sizes). `dataLonLatBounds`
	// must keep the shown context inside the Atlantic gap regardless.
	test('a small facet cell (low natural zoom) stays within the safe ocean gap, not a whole extra continent', () => {
		const bounds = { left: 0, top: 0, width: 244, height: 60 };
		const projection = fitInto(bounds);
		const tiles = visibleTiles(projection, bounds, 256, 0, 19, dataLonLatBounds);
		expect(tiles.length).toBeGreaterThan(0);

		const z = tiles[0].z;
		const minTileX = Math.min(...tiles.map((t) => t.x));
		const maxTileX = Math.max(...tiles.map((t) => t.x));
		const tileXToLon = (x: number) => (x / 2 ** z) * 360 - 180;
		const west = tileXToLon(minTileX);
		const east = tileXToLon(maxTileX + 1);

		// West Africa's coast sits around -17°E - comfortably clear of it.
		expect(east).toBeLessThan(-17);
		// Deep in open Pacific on the other side - nowhere near land.
		expect(west).toBeGreaterThan(-140);
	});

	test('the zoom floor engages once the context clamp actually reduces the bounds, so a single tile cannot overshoot into land', () => {
		const bounds = { left: 0, top: 0, width: 244, height: 60 };
		const projection = fitInto(bounds);
		const tiles = visibleTiles(projection, bounds, 256, 0, 19, dataLonLatBounds);
		expect(tiles[0].z).toBeGreaterThanOrEqual(6);
	});

	test('a cell whose aspect ratio is already close to the data is unaffected by dataLonLatBounds', () => {
		const bounds = { left: 0, top: 0, width: 392, height: 476 };
		const projection = fitInto(bounds);
		const withoutBounds = visibleTiles(projection, bounds, 256, 0, 19);
		const withBounds = visibleTiles(projection, bounds, 256, 0, 19, dataLonLatBounds);
		expect(withBounds).toEqual(withoutBounds);
	});
});

describe('tileScreenBounds', () => {
	test('returns a positive-size box for every tile a fit was built for - the whole point of `buildMercatorFit` is that this never nulls out mid-grid tiles the way forward-projecting each corner individually used to', () => {
		// A projection whose fitted scale/translate differ sharply from a real
		// d3-geo mercator's own construction-time defaults - the scenario that
		// broke the old corner-forward-projection approach (see
		// `buildMercatorFit`'s doc comment).
		const projection = makeMockProjection(4, 400, 300);
		const bounds = { left: 0, top: 0, width: 400, height: 300 };
		const tiles = visibleTiles(projection, bounds, 256, 0, 19);
		expect(tiles.length).toBeGreaterThan(0);
		const fit = buildMercatorFit(projection, bounds, tiles[0].z);
		expect(fit).not.toBeNull();
		for (const tile of tiles) {
			const box = tileScreenBounds(fit!, tile);
			expect(box).not.toBeNull();
			expect(box!.width).toBeGreaterThan(0);
			expect(box!.height).toBeGreaterThan(0);
		}
	});

	test('returns null for a tile from a different zoom level than the fit was built for', () => {
		const projection = makeMockProjection(4, 400, 300);
		const bounds = { left: 0, top: 0, width: 400, height: 300 };
		const fit = buildMercatorFit(projection, bounds, 2);
		expect(tileScreenBounds(fit!, { x: 1, y: 1, z: 3 })).toBeNull();
	});
});
