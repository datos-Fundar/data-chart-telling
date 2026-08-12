import type { GeoProjectionConfig } from '$lib/types/layout/coordinates';

/**
 * `data` (see `resolveProjection`) is one row per disjoint geometry *part*
 * (see `Plot.svelte`'s `hoverCandidates` — needed so hover-matching finds
 * every part of a multi-part feature, not just whichever one its combined
 * centroid happens to land near), not one row per feature. Several rows
 * therefore share the exact same `geometry` object by reference — spread
 * from the same tagged feature, only `__cx`/`__cy` differ. Deduping by that
 * reference before handing rows to d3-geo's bounds/fit computation matters:
 * a feature with many parts (e.g. a province whose `MultiPolygon` has
 * hundreds of small islands) would otherwise have its *entire* geometry
 * re-traversed once per part it contributed, an accidental O(parts²) cost
 * that got severe enough to be visible (multi-second) on real IGN data.
 */
function dedupeByGeometry<TFeature extends { geometry?: unknown }>(data: TFeature[]): TFeature[] {
  const seen = new Set<unknown>();
  const result: TFeature[] = [];
  for (const row of data) {
    if (seen.has(row.geometry)) continue;
    seen.add(row.geometry);
    result.push(row);
  }
  return result;
}

/**
 * Resolves a `GeoScalesConfig['projection']` into what svelteplot's own
 * `<Plot projection>` expects — kept separate from `GeoPlot`'s own
 * `Plot.svelte` so adding more projection-level behavior (like the
 * `domain: 'data'` sentinel below) doesn't grow that component itself.
 */
export function resolveProjection<TFeature extends Record<string, unknown> & { geometry?: unknown }>(
  projection: GeoProjectionConfig | undefined,
  data: TFeature[],
): GeoProjectionConfig {
  if (!projection) return 'equal-earth';
  if (typeof projection === 'string') return projection;
  const domain =
    projection.domain === 'data'
      ? ({ type: 'FeatureCollection', features: dedupeByGeometry(data) } as unknown as GeoJSON.FeatureCollection)
      : projection.domain;
  return {
    type: projection.type,
    rotate: projection.rotate,
    center: projection.center,
    parallels: projection.parallels,
    inset: projection.inset,
    clip: projection.clip,
    domain,
  };
}
