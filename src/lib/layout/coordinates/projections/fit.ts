/**
 * Wraps a handful of representative `[lon, lat]` points as a `MultiPoint`
 * Feature, just so `projection.fitExtent`/`fitSize` has something to
 * measure. Custom projections built on these live in `src/lib` (see
 * `stories/plots/map/geo/data.ts` for why real border geometry doesn't), so a
 * few hand-picked extremity points stand in for a region's true extent.
 */
export function pointsToFitFeature(points: [number, number][]): GeoJSON.Feature {
	return {
		type: 'Feature',
		properties: null,
		geometry: { type: 'MultiPoint', coordinates: points }
	};
}
