import type { Segment, Segments } from '$lib/types/plots/styles';

const DEFAULT_KEY = 'default';

/** Feature-specific segments listed after 'default' so they override it on merge (see `resolveFeatureStyle`). */
export function resolveSegmentsForFeature<TStyle>(segments: Segments<TStyle>, featureId: string): Segment<TStyle>[] {
  return [...(segments[DEFAULT_KEY] ?? []), ...(segments[featureId] ?? [])];
}

/**
 * A geo feature is atomic — `Segment.areas` (x/y range restriction) doesn't
 * apply, so every entry under a key is treated as a flat style patch applied
 * in order: `'default'` entries apply first, feature-specific entries
 * override. This intentionally does NOT reuse `segments.ts`'s
 * `validateSegments` — its "only the first catch-all wins" warning assumes
 * area-based semantics that don't hold here, since every geo segment entry
 * merges rather than being dropped.
 */
export function resolveFeatureStyle<TStyle extends object>(segments: Segments<TStyle>, featureId: string): TStyle {
  return resolveSegmentsForFeature(segments, featureId).reduce(
    (acc, seg) => ({ ...acc, ...(seg.style ?? {}) }),
    {} as TStyle,
  );
}
