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

/** An affine tile-space → screen-space mapping (see `buildMercatorFit`), reused across every tile in a grid instead of forward-projecting each one individually. */
export type MercatorFit = {
  z: number;
  screenLeft: number;
  screenTop: number;
  tileXAtLeft: number;
  tileYAtTop: number;
  pxPerTileX: number;
  pxPerTileY: number;
};

/**
 * Builds an affine tile-space → screen-space mapping from two reliable
 * anchor points — `bounds`' own top-left/bottom-right corners, inverted
 * back to lon/lat — rather than forward-projecting each tile's own corners
 * individually (what this replaced). That per-tile approach broke under a
 * projection whose scale/translate were fit to a *custom* domain rather
 * than set via its own `.scale()`/`.translate()`: `d3-geo`'s cylindrical
 * projections (mercator included) auto-install an internal `clipExtent`
 * sized to whatever scale/translate they were constructed or last
 * `.scale()`/`.translate()`-called with (guarding against the y → ±Infinity
 * blowup near the poles); svelteplot's own domain-fitting wraps the
 * *unmodified* projection instance in an external transform instead of
 * calling those setters, so that internal clip keeps silently rejecting
 * forward-projected points outside its stale bounds — nulling out most of
 * a tile grid even for tiles nowhere near a pole. `.invert()` isn't routed
 * through that clip, so anchoring to two known-good inverted corners
 * sidesteps it entirely — sound because Mercator's tile space (longitude,
 * and the standard log-tan latitude transform used by `latToTileY`) is
 * affine in screen space by construction, so one linear fit applies
 * uniformly to every tile in the grid.
 */
export function buildMercatorFit(projection: ProjectionLike, bounds: ScreenBounds, z: number): MercatorFit | null {
  if (!projection.invert) return null;
  const topLeft = projection.invert([bounds.left, bounds.top]);
  const bottomRight = projection.invert([bounds.left + bounds.width, bounds.top + bounds.height]);
  if (!topLeft || !bottomRight) return null;

  const tileXAtLeft = lonToTileX(topLeft[0], z);
  const tileXAtRight = lonToTileX(bottomRight[0], z);
  const tileYAtTop = latToTileY(topLeft[1], z);
  const tileYAtBottom = latToTileY(bottomRight[1], z);
  if (tileXAtRight === tileXAtLeft || tileYAtBottom === tileYAtTop) return null;

  return {
    z,
    screenLeft: bounds.left,
    screenTop: bounds.top,
    tileXAtLeft,
    tileYAtTop,
    pxPerTileX: bounds.width / (tileXAtRight - tileXAtLeft),
    pxPerTileY: bounds.height / (tileYAtBottom - tileYAtTop),
  };
}

/** Places a tile on screen via a `MercatorFit` — `null` only if `tile` is from a different zoom level than the fit was built for. */
export function tileScreenBounds(fit: MercatorFit, tile: TileCoord): ScreenBounds | null {
  if (tile.z !== fit.z) return null;
  return {
    left: fit.screenLeft + (tile.x - fit.tileXAtLeft) * fit.pxPerTileX,
    top: fit.screenTop + (tile.y - fit.tileYAtTop) * fit.pxPerTileY,
    width: fit.pxPerTileX,
    height: fit.pxPerTileY,
  };
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
