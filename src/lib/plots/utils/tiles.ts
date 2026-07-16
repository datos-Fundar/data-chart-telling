export type TileCoord = { x: number; y: number; z: number };

export type ScreenBounds = { left: number; top: number; width: number; height: number };

/** The subset of a `d3-geo`-style projection this module needs. */
export type ProjectionLike = {
  (point: [number, number]): [number, number] | null;
  invert?(point: [number, number]): [number, number] | null;
};

/** The minimal geometry-stream shape a projection's `.stream()` accepts — kept local instead of importing `d3-geo`'s own `GeoStream` type, so this module stays dependency-free. */
type MinimalStream = {
  point: (x: number, y: number, z?: number) => void;
  lineStart: () => void;
  lineEnd: () => void;
  polygonStart: () => void;
  polygonEnd: () => void;
  sphere?: () => void;
};

/** What `toProjectionLike` needs from a svelteplot-resolved projection. */
export type StreamingProjection = {
  stream: (s: MinimalStream) => MinimalStream;
  invert?: (point: [number, number]) => [number, number] | null;
};

/**
 * Adapts a svelteplot-resolved projection (which exposes `.stream()`/
 * `.invert()`, but — unlike a raw `d3-geo` projection instance — isn't
 * itself callable as `(point) => [x, y]`) into a `ProjectionLike`, by
 * feeding a single point through its stream pipeline and capturing the
 * projected output.
 */
export function toProjectionLike(projection: StreamingProjection): ProjectionLike {
  const fn = ((point: [number, number]) => {
    let result: [number, number] | null = null;
    const sink: MinimalStream = {
      point: (x, y) => {
        result = [x, y];
      },
      lineStart() {},
      lineEnd() {},
      polygonStart() {},
      polygonEnd() {},
    };
    projection.stream(sink).point(point[0], point[1]);
    return result;
  }) as ProjectionLike;
  if (projection.invert) fn.invert = (point) => projection.invert!(point);
  return fn;
}

function lonToTileX(lon: number, z: number): number {
  return ((lon + 180) / 360) * 2 ** z;
}

function latToTileY(lat: number, z: number): number {
  const rad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** z;
}

function tileXToLon(x: number, z: number): number {
  return (x / 2 ** z) * 360 - 180;
}

function tileYToLat(y: number, z: number): number {
  const n = Math.PI - (2 * Math.PI * y) / 2 ** z;
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

/**
 * Picks an integer XYZ zoom level whose tile pixel density roughly matches
 * the projection's *current* pixels-per-degree at the map center — so tiles
 * neither look blurry (too coarse) nor waste bandwidth (too fine).
 */
function estimateZoomLevel(
  projection: ProjectionLike,
  centerLon: number,
  centerLat: number,
  tileSize: number,
): number | null {
  const eps = 0.01;
  const p0 = projection([centerLon, centerLat]);
  const p1 = projection([centerLon + eps, centerLat]);
  if (!p0 || !p1) return null;
  const pixelsPerDegree = Math.abs(p1[0] - p0[0]) / eps;
  const worldPixelsAtZ0 = tileSize / 360;
  const ratio = pixelsPerDegree / worldPixelsAtZ0;
  if (!Number.isFinite(ratio) || ratio <= 0) return null;
  return Math.round(Math.log2(ratio));
}

/**
 * Derives the visible XYZ tile grid from svelteplot's own already-fitted
 * projection (rather than this package computing/duplicating a `d3-geo` fit
 * itself) — see `TileLayer.svelte`. Only correct for Mercator-family
 * projections, where a screen-space rectangle maps back to a lon/lat bbox
 * whose tile coverage is well-defined; callers are responsible for the
 * projection-compatibility check (see `Plot.svelte`'s validation effect).
 */
export function visibleTiles(
  projection: ProjectionLike,
  bounds: ScreenBounds,
  tileSize = 256,
  minZoom = 0,
  maxZoom = 19,
): TileCoord[] {
  if (!projection.invert) return [];

  const corners: [number, number][] = [
    [bounds.left, bounds.top],
    [bounds.left + bounds.width, bounds.top],
    [bounds.left, bounds.top + bounds.height],
    [bounds.left + bounds.width, bounds.top + bounds.height],
  ];
  const lonLats = corners.map((c) => projection.invert!(c)).filter((p): p is [number, number] => p != null);
  if (lonLats.length === 0) return [];

  const centerScreen: [number, number] = [bounds.left + bounds.width / 2, bounds.top + bounds.height / 2];
  const center = projection.invert(centerScreen);
  const z = center
    ? Math.max(minZoom, Math.min(maxZoom, estimateZoomLevel(projection, center[0], center[1], tileSize) ?? minZoom))
    : minZoom;

  const lons = lonLats.map((p) => p[0]);
  const lats = lonLats.map((p) => p[1]);
  const minTileX = Math.floor(lonToTileX(Math.min(...lons), z));
  const maxTileX = Math.floor(lonToTileX(Math.max(...lons), z));
  const minTileY = Math.floor(latToTileY(Math.max(...lats), z));
  const maxTileY = Math.floor(latToTileY(Math.min(...lats), z));

  const maxTile = 2 ** z - 1;
  const tiles: TileCoord[] = [];
  for (let x = Math.max(0, minTileX); x <= Math.min(maxTile, maxTileX); x++) {
    for (let y = Math.max(0, minTileY); y <= Math.min(maxTile, maxTileY); y++) {
      tiles.push({ x, y, z });
    }
  }
  return tiles;
}

/** Projects a tile's four corners back through the same projection to place it on screen. */
export function tileScreenBounds(projection: ProjectionLike, tile: TileCoord): ScreenBounds | null {
  const lon1 = tileXToLon(tile.x, tile.z);
  const lon2 = tileXToLon(tile.x + 1, tile.z);
  const lat1 = tileYToLat(tile.y, tile.z);
  const lat2 = tileYToLat(tile.y + 1, tile.z);

  const corners = [projection([lon1, lat1]), projection([lon2, lat2])];
  if (corners.some((c) => c == null)) return null;
  const [p1, p2] = corners as [number, number][];

  const left = Math.min(p1[0], p2[0]);
  const top = Math.min(p1[1], p2[1]);
  return { left, top, width: Math.abs(p2[0] - p1[0]), height: Math.abs(p2[1] - p1[1]) };
}

/**
 * Fills `{z}/{x}/{y}` placeholders in a tile URL template. Also supports
 * `{-y}` for TMS-scheme sources (e.g. IGN's tile services), whose row index
 * counts from the south instead of the north — the standard XYZ-to-TMS
 * conversion `2^z - 1 - y`.
 */
export function tileUrl(template: string, tile: TileCoord): string {
  return template
    .replace('{z}', String(tile.z))
    .replace('{x}', String(tile.x))
    .replace('{-y}', String(2 ** tile.z - 1 - tile.y))
    .replace('{y}', String(tile.y));
}
