import { describe, test, expect } from 'vitest';
import { geoMercator } from 'd3-geo';
import { visibleTiles, tileScreenBounds, tileUrl, toProjectionLike, type ProjectionLike } from '$lib/plots/utils/tiles';

// A simple linear (equirectangular-like) mock projection: screen pixel
// (px, py) <-> lon/lat via a configurable pixels-per-degree scale — enough
// to exercise `visibleTiles`/`tileScreenBounds`'s math without depending on
// a real `d3-geo` projection.
function makeMockProjection(pixelsPerDegree: number, width: number, height: number): ProjectionLike {
  const forward = ((point: [number, number]) => {
    const [lon, lat] = point;
    return [width / 2 + lon * pixelsPerDegree, height / 2 - lat * pixelsPerDegree] as [number, number];
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
      'https://tile.example/2/3/5.png',
    );
  });

  test('a template with no placeholders is returned unchanged', () => {
    expect(tileUrl('https://tile.example/static.png', { x: 1, y: 1, z: 1 })).toBe(
      'https://tile.example/static.png',
    );
  });

  test('substitutes {-y} as the TMS-flipped row (2^z - 1 - y)', () => {
    expect(tileUrl('https://tile.example/{z}/{x}/{-y}.png', { x: 3, y: 5, z: 3 })).toBe(
      'https://tile.example/3/3/2.png',
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
    const tiles = visibleTiles(projection, { left: 0, top: 0, width: 400, height: 300 }, 256, 0, 19);
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
    const tiles = visibleTiles(projection, { left: 0, top: 0, width: 4000, height: 3000 }, 256, 0, 5);
    expect(tiles.length).toBeGreaterThan(0);
    for (const t of tiles) expect(t.z).toBeLessThanOrEqual(5);
  });

  test('a wider viewport at the same scale covers at least as many tiles as a narrower one', () => {
    const projection = makeMockProjection(4, 400, 300);
    const narrow = visibleTiles(projection, { left: 150, top: 100, width: 20, height: 20 }, 256, 0, 19);
    const wide = visibleTiles(projection, { left: 0, top: 0, width: 400, height: 300 }, 256, 0, 19);
    expect(wide.length).toBeGreaterThanOrEqual(narrow.length);
  });
});

// ── tileScreenBounds ────────────────────────────────────────────────────────────

describe('tileScreenBounds', () => {
  test('returns null when the projection cannot place one of the tile corners', () => {
    // z=0's single tile spans the whole globe, including high latitudes.
    const failing = ((point: [number, number]) => (point[1] > 80 ? null : [0, 0])) as ProjectionLike;
    expect(tileScreenBounds(failing, { x: 0, y: 0, z: 0 })).toBeNull();
  });

  test('returns a positive-size box for a valid tile', () => {
    const projection = makeMockProjection(4, 400, 300);
    const bounds = tileScreenBounds(projection, { x: 1, y: 1, z: 2 });
    expect(bounds).not.toBeNull();
    expect(bounds!.width).toBeGreaterThan(0);
    expect(bounds!.height).toBeGreaterThan(0);
  });
});
