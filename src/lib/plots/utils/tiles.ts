export type TileCoord = { x: number; y: number; z: number };

export type ScreenBounds = { left: number; top: number; width: number; height: number };

/** The subset of a `d3-geo`-style projection this module needs. */
export type ProjectionLike = {
	(point: [number, number]): [number, number] | null;
	invert?(point: [number, number]): [number, number] | null;
};

/** The minimal geometry-stream shape a projection's `.stream()` accepts - kept local instead of importing `d3-geo`'s own `GeoStream` type, so this module stays dependency-free. */
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
 * `.invert()`, but - unlike a raw `d3-geo` projection instance - isn't
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
			polygonEnd() {}
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
 * the projection's *current* pixels-per-degree at the map center - so tiles
 * neither look blurry (too coarse) nor waste bandwidth (too fine).
 */
function estimateZoomLevel(
	projection: ProjectionLike,
	centerLon: number,
	centerLat: number,
	tileSize: number
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
 * Clamps `bounds`' horizontal extent to at most *half* a world-width (180°
 * of longitude), centered on the box's own center, before any corner of it
 * gets inverted.
 */
function clampBoundsToWorld(projection: ProjectionLike, bounds: ScreenBounds): ScreenBounds {
	if (!projection.invert) return bounds;
	const centerX = bounds.left + bounds.width / 2;
	const centerY = bounds.top + bounds.height / 2;
	const centerLonLat = projection.invert([centerX, centerY]);
	if (!centerLonLat) return bounds;
	const west = projection([-180, centerLonLat[1]]);
	const east = projection([180, centerLonLat[1]]);
	if (!west || !east) return bounds;
	const maxWidth = Math.abs(east[0] - west[0]) / 2;
	if (!(maxWidth > 0) || bounds.width <= maxWidth) return bounds;
	return { ...bounds, left: centerX - maxWidth / 2, width: maxWidth };
}

/**
 * How far a letterboxed tile margin may reach beyond the data's own
 * bounding box (see `Plot.svelte`'s `dataLonLatBounds`), on either side -
 * the product-level cap on how much basemap "context" gets shown, well
 * inside `clampBoundsToWorld`'s own (much looser) antimeridian-safety cap.
 *
 * Picked to comfortably clear the nearest *other* landmass in any direction
 * from Argentina - this package's one real-world `domain: 'data'` +
 * tile-layer consumer. The tightest real constraint is the Atlantic side:
 * Argentina's own east edge sits at -53°, and the nearest land across it
 * (West Africa) starts around -17° - a 36°-wide ocean gap. A flat 20° here
 * stays comfortably inside that gap on the tight side, while every other
 * direction (west into the Pacific, especially) has far more real ocean to
 * spare than this uses.
 */
const CONTEXT_PADDING_DEGREES = 20;

/**
 * A raster tile is atomic - one straddling the padding boundary above still
 * renders in full, so at a low enough zoom a single tile can overshoot
 * `CONTEXT_PADDING_DEGREES` by tens of degrees (confirmed empirically: a
 * small facet cell naturally estimates z≈1-2, where a tile is 90°-180°
 * wide, dragging in all of Africa well past the intended padding). Flooring
 * the zoom to at least this, whenever `clampBoundsToDataPadding` actually
 * reduced the bounds, guarantees a tile is at most 360/2⁶ = 5.625° wide -
 * comfortably under half of `CONTEXT_PADDING_DEGREES`, so the worst-case
 * overshoot still lands well short of real land.
 */
const MIN_ZOOM_WHEN_CONTEXT_CLAMPED = 6;

/**
 * Clamps `bounds`' horizontal extent to the data's own lon/lat bbox padded
 * by `CONTEXT_PADDING_DEGREES` on each side, at the box's own center
 * latitude - a no-op when `dataLonLatBounds` isn't supplied (a plot with no
 * tile-layer-relevant data footprint, e.g. not a `domain: 'data'` fit; see
 * `Plot.svelte`'s `usesDataFit`). Independent of, and applied on top of,
 * `clampBoundsToWorld`'s own antimeridian-safety cap - that cap alone still
 * permits up to a quarter-turn of the globe each way, comfortably reaching
 * an unrelated continent instead of just nearby ocean (see `GeoPlot/Facet`
 * stories' `Rows2Cols2` for the regression this fixes).
 */
function clampBoundsToDataPadding(
	projection: ProjectionLike,
	bounds: ScreenBounds,
	dataLonLatBounds: [number, number, number, number] | null | undefined
): ScreenBounds {
	if (!dataLonLatBounds || !projection.invert) return bounds;
	const [minLon, , maxLon] = dataLonLatBounds;
	const centerLonLat = projection.invert([
		bounds.left + bounds.width / 2,
		bounds.top + bounds.height / 2
	]);
	if (!centerLonLat) return bounds;
	const west = projection([minLon - CONTEXT_PADDING_DEGREES, centerLonLat[1]]);
	const east = projection([maxLon + CONTEXT_PADDING_DEGREES, centerLonLat[1]]);
	if (!west || !east) return bounds;
	const left = Math.max(bounds.left, Math.min(west[0], east[0]));
	const right = Math.min(bounds.left + bounds.width, Math.max(west[0], east[0]));
	if (!(right > left)) return bounds;
	return { ...bounds, left, width: right - left };
}

/**
 * Derives the visible XYZ tile grid from svelteplot's own already-fitted
 * projection (rather than this package computing/duplicating a `d3-geo` fit
 * itself) - see `TileLayer.svelte`. Only correct for Mercator-family
 * projections, where a screen-space rectangle maps back to a lon/lat bbox
 * whose tile coverage is well-defined; callers are responsible for the
 * projection-compatibility check (see `Plot.svelte`'s validation effect).
 */
export function visibleTiles(
	projection: ProjectionLike,
	rawBounds: ScreenBounds,
	tileSize = 256,
	minZoom = 0,
	maxZoom = 19,
	dataLonLatBounds?: [number, number, number, number] | null
): TileCoord[] {
	if (!projection.invert) return [];
	const bounds = clampBoundsToDataPadding(
		projection,
		clampBoundsToWorld(projection, rawBounds),
		dataLonLatBounds
	);
	const contextClamped = bounds.width < rawBounds.width;

	const corners: [number, number][] = [
		[bounds.left, bounds.top],
		[bounds.left + bounds.width, bounds.top],
		[bounds.left, bounds.top + bounds.height],
		[bounds.left + bounds.width, bounds.top + bounds.height]
	];
	const lonLats = corners
		.map((c) => projection.invert!(c))
		.filter((p): p is [number, number] => p != null);
	if (lonLats.length === 0) return [];

	const effectiveMinZoom = contextClamped
		? Math.max(minZoom, MIN_ZOOM_WHEN_CONTEXT_CLAMPED)
		: minZoom;
	const centerScreen: [number, number] = [
		bounds.left + bounds.width / 2,
		bounds.top + bounds.height / 2
	];
	const center = projection.invert(centerScreen);
	const z = center
		? Math.max(
				effectiveMinZoom,
				Math.min(
					maxZoom,
					estimateZoomLevel(projection, center[0], center[1], tileSize) ?? effectiveMinZoom
				)
			)
		: effectiveMinZoom;

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
 * anchor points - `bounds`' own top-left/bottom-right corners, inverted
 * back to lon/lat - rather than forward-projecting each tile's own corners
 * individually (what this replaced). That per-tile approach broke under a
 * projection whose scale/translate were fit to a *custom* domain rather
 * than set via its own `.scale()`/`.translate()`: `d3-geo`'s cylindrical
 * projections (mercator included) auto-install an internal `clipExtent`
 * sized to whatever scale/translate they were constructed or last
 * `.scale()`/`.translate()`-called with (guarding against the y → ±Infinity
 * blowup near the poles); svelteplot's own domain-fitting wraps the
 * *unmodified* projection instance in an external transform instead of
 * calling those setters, so that internal clip keeps silently rejecting
 * forward-projected points outside its stale bounds - nulling out most of
 * a tile grid even for tiles nowhere near a pole. `.invert()` isn't routed
 * through that clip, so anchoring to two known-good inverted corners
 * sidesteps it entirely - sound because Mercator's tile space (longitude,
 * and the standard log-tan latitude transform used by `latToTileY`) is
 * affine in screen space by construction, so one linear fit applies
 * uniformly to every tile in the grid.
 */
export function buildMercatorFit(
	projection: ProjectionLike,
	rawBounds: ScreenBounds,
	z: number,
	dataLonLatBounds?: [number, number, number, number] | null
): MercatorFit | null {
	if (!projection.invert) return null;
	const bounds = clampBoundsToDataPadding(
		projection,
		clampBoundsToWorld(projection, rawBounds),
		dataLonLatBounds
	);
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
		pxPerTileY: bounds.height / (tileYAtBottom - tileYAtTop)
	};
}

/** Places a tile on screen via a `MercatorFit` - `null` only if `tile` is from a different zoom level than the fit was built for. */
export function tileScreenBounds(fit: MercatorFit, tile: TileCoord): ScreenBounds | null {
	if (tile.z !== fit.z) return null;
	return {
		left: fit.screenLeft + (tile.x - fit.tileXAtLeft) * fit.pxPerTileX,
		top: fit.screenTop + (tile.y - fit.tileYAtTop) * fit.pxPerTileY,
		width: fit.pxPerTileX,
		height: fit.pxPerTileY
	};
}

/**
 * Fills `{z}/{x}/{y}` placeholders in a tile URL template. Also supports
 * `{-y}` for TMS-scheme sources (e.g. IGN's tile services), whose row index
 * counts from the south instead of the north - the standard XYZ-to-TMS
 * conversion `2^z - 1 - y`.
 */
export function tileUrl(template: string, tile: TileCoord): string {
	return template
		.replace('{z}', String(tile.z))
		.replace('{x}', String(tile.x))
		.replace('{-y}', String(2 ** tile.z - 1 - tile.y))
		.replace('{y}', String(tile.y));
}
