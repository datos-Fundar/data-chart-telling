import type { GeoFeature } from '$lib/types/plots/data/geo';

function flattenCoords(geom: GeoJSON.Geometry, out: [number, number][]): void {
  switch (geom.type) {
    case 'Point':
      out.push(geom.coordinates as [number, number]);
      break;
    case 'MultiPoint':
    case 'LineString':
      for (const c of geom.coordinates as [number, number][]) out.push(c);
      break;
    case 'MultiLineString':
    case 'Polygon':
      for (const ring of geom.coordinates as [number, number][][]) {
        for (const c of ring) out.push(c);
      }
      break;
    case 'MultiPolygon':
      for (const poly of geom.coordinates as [number, number][][][]) {
        for (const ring of poly) {
          for (const c of ring) out.push(c);
        }
      }
      break;
    case 'GeometryCollection':
      for (const g of geom.geometries) flattenCoords(g, out);
      break;
  }
}

function boundsCenter(coords: [number, number][]): [number, number] {
  if (coords.length === 0) return [0, 0];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of coords) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return [(minX + maxX) / 2, (minY + maxY) / 2];
}

/**
 * Bounding-box center of a geometry's flattened coordinates — a cheap
 * approximation used for default label placement, not a true
 * geographic/area centroid (no polygon-hole or geodesic-area weighting).
 * For hover-matching specifically, see `geometryPartCentroids` instead —
 * this single combined point can land far from every actual part of a
 * multi-part geometry whose pieces are geographically spread out.
 */
export function geometryCentroid(geometry: GeoJSON.Geometry): [number, number] {
  const coords: [number, number][] = [];
  flattenCoords(geometry, coords);
  return boundsCenter(coords);
}

/**
 * Splits a geometry into its disjoint parts: one `Polygon` per element of a
 * `MultiPolygon`'s `coordinates`, one `LineString` per element of a
 * `MultiLineString`'s, `GeometryCollection` recursed and flattened, and any
 * other geometry type returned unchanged as its own single-element array.
 * The shared building block behind `geometryPartCentroids` (one centroid per
 * part) and `filterGeometryParts` (keep/drop whole parts).
 */
export function splitGeometryParts(geometry: GeoJSON.Geometry): GeoJSON.Geometry[] {
  switch (geometry.type) {
    case 'MultiPolygon':
      return geometry.coordinates.map((polygon) => ({ type: 'Polygon', coordinates: polygon }));
    case 'MultiLineString':
      return geometry.coordinates.map((line) => ({ type: 'LineString', coordinates: line }));
    case 'GeometryCollection':
      return geometry.geometries.flatMap((g) => splitGeometryParts(g));
    default:
      return [geometry];
  }
}

/**
 * Like `geometryCentroid`, but returns one point per disjoint part instead
 * of a single bounding-box center across all of them. A `MultiPolygon`
 * whose parts are geographically far apart — e.g. Argentina's "Tierra del
 * Fuego, Antártida e Islas del Atlántico Sur" province, whose `MultiPolygon`
 * spans the mainland island, the Antarctic sector, and the South Atlantic
 * islands in one feature — would otherwise get a single hover point
 * stranded somewhere between all of them, matching hovers over *none* of
 * the actually-rendered shapes. Multiple points attributed to the same
 * feature is fine for hover-matching (nearest point wins, whichever part
 * that is); it's only label placement (`geometryCentroid`) that needs a
 * single point.
 */
export function geometryPartCentroids(geometry: GeoJSON.Geometry): [number, number][] {
  return splitGeometryParts(geometry).map((part) => geometryCentroid(part));
}

/**
 * Keeps or drops each disjoint part of a geometry (see `splitGeometryParts`)
 * based on a per-part predicate, reassembling a geometry of the same type
 * from whatever survives — `null` if nothing does. Used to let a single
 * feature's geometry be split between the main map and an `inset` marker
 * (see `GeoDataProps.excludeParts`/`GeoInsetMarker.featurePartsFilter`)
 * without preprocessing the source data: e.g. a province whose `MultiPolygon`
 * spans both a mainland part and a far-flung part can have the main map
 * exclude the latter while an inset shows only it.
 */
export function filterGeometryParts(
  geometry: GeoJSON.Geometry,
  keep: (part: { centroid: [number, number]; geometry: GeoJSON.Geometry }) => boolean,
): GeoJSON.Geometry | null {
  const parts = splitGeometryParts(geometry);
  const keptParts = parts.filter((part) => keep({ centroid: geometryCentroid(part), geometry: part }));
  if (keptParts.length === parts.length) return geometry;
  if (keptParts.length === 0) return null;
  if (parts.length === 1) return keptParts[0];
  switch (geometry.type) {
    case 'MultiPolygon':
      return { type: 'MultiPolygon', coordinates: keptParts.map((part) => (part as GeoJSON.Polygon).coordinates) };
    case 'MultiLineString':
      return {
        type: 'MultiLineString',
        coordinates: keptParts.map((part) => (part as GeoJSON.LineString).coordinates),
      };
    case 'GeometryCollection':
      return { type: 'GeometryCollection', geometries: keptParts };
    default:
      return geometry;
  }
}

/** Default `featureId`: `feature.id`, else `properties.id`, else `properties.name`. */
export function defaultFeatureId<TProps extends Record<string, unknown>>(f: GeoFeature<TProps>): string {
  const props = f.properties as Record<string, unknown> | null;
  return String(f.id ?? props?.id ?? props?.name ?? '');
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Densifies a great-circle arc between two lon/lat points into `steps + 1`
 * points via spherical linear interpolation (slerp) — used to draw a `link`
 * marker's geodesic curve through the `Geo` mark (see `Plot.svelte`).
 *
 * Not delegated to svelteplot's own `Link` mark: its 0.14.2 projection
 * integration (`Mark.svelte`'s paired-channel handling) reads a single
 * `row.x`/`row.y` pair regardless of channel suffix, so a mark bound to
 * `x1`/`y1`/`x2`/`y2` (never plain `x`/`y`) resolves every point as invalid
 * whenever the plot has an active `projection` scale — which GeoPlot always
 * does. `Geo` has no such limitation (geo marks are explicitly excluded from
 * that code path), so a manually-interpolated `LineString` feature sidesteps
 * the bug entirely while still producing the same geodesic visual.
 */
export function greatCircleInterpolate(
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number,
  steps = 64,
): [number, number][] {
  const phi1 = toRad(lat1);
  const lambda1 = toRad(lon1);
  const phi2 = toRad(lat2);
  const lambda2 = toRad(lon2);
  const sinPhi1 = Math.sin(phi1);
  const cosPhi1 = Math.cos(phi1);
  const sinPhi2 = Math.sin(phi2);
  const cosPhi2 = Math.cos(phi2);

  const d =
    2 *
    Math.asin(
      Math.sqrt(Math.sin((phi2 - phi1) / 2) ** 2 + cosPhi1 * cosPhi2 * Math.sin((lambda2 - lambda1) / 2) ** 2),
    );
  if (!Number.isFinite(d) || d === 0) {
    return [
      [lon1, lat1],
      [lon2, lat2],
    ];
  }

  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const a = Math.sin((1 - f) * d) / Math.sin(d);
    const b = Math.sin(f * d) / Math.sin(d);
    const x = a * cosPhi1 * Math.cos(lambda1) + b * cosPhi2 * Math.cos(lambda2);
    const y = a * cosPhi1 * Math.sin(lambda1) + b * cosPhi2 * Math.sin(lambda2);
    const z = a * sinPhi1 + b * sinPhi2;
    const phi = Math.atan2(z, Math.sqrt(x * x + y * y));
    const lambda = Math.atan2(y, x);
    points.push([toDeg(lambda), toDeg(phi)]);
  }
  return points;
}
