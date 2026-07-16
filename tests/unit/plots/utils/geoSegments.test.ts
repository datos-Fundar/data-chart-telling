import { describe, test, expect } from 'vitest';
import { resolveSegmentsForFeature, resolveFeatureStyle } from '$lib/plots/utils/geoSegments';
import type { Segments } from '$lib/types/plots/styles';
import type { GeoSegmentStyle } from '$lib/types/plots/geo/styles';

// ── resolveSegmentsForFeature ──────────────────────────────────────────────────

describe('resolveSegmentsForFeature', () => {
  test('returns an empty list when no segments are configured', () => {
    expect(resolveSegmentsForFeature({}, 'argentina')).toEqual([]);
  });

  test('returns only default entries when the feature has no specific key', () => {
    const segments: Segments<GeoSegmentStyle> = { default: [{ style: { fill: 'grey' } }] };
    expect(resolveSegmentsForFeature(segments, 'chile')).toEqual([{ style: { fill: 'grey' } }]);
  });

  test('returns only feature-specific entries when there is no default', () => {
    const segments: Segments<GeoSegmentStyle> = { argentina: [{ style: { fill: 'tomato' } }] };
    expect(resolveSegmentsForFeature(segments, 'argentina')).toEqual([{ style: { fill: 'tomato' } }]);
  });

  test('default entries come first, feature-specific entries last', () => {
    const segments: Segments<GeoSegmentStyle> = {
      default: [{ style: { fill: 'grey' } }],
      argentina: [{ style: { fill: 'tomato' } }],
    };
    expect(resolveSegmentsForFeature(segments, 'argentina')).toEqual([
      { style: { fill: 'grey' } },
      { style: { fill: 'tomato' } },
    ]);
  });

  test('a feature with an unrelated key present in segments is unaffected', () => {
    const segments: Segments<GeoSegmentStyle> = { chile: [{ style: { fill: 'blue' } }] };
    expect(resolveSegmentsForFeature(segments, 'argentina')).toEqual([]);
  });
});

// ── resolveFeatureStyle ─────────────────────────────────────────────────────────

describe('resolveFeatureStyle', () => {
  test('returns an empty style when no segments match', () => {
    expect(resolveFeatureStyle<GeoSegmentStyle>({}, 'argentina')).toEqual({});
  });

  test('applies the default style when no feature-specific entry exists', () => {
    const segments: Segments<GeoSegmentStyle> = { default: [{ style: { fill: 'grey', strokeWidth: 1 } }] };
    expect(resolveFeatureStyle<GeoSegmentStyle>(segments, 'chile')).toEqual({ fill: 'grey', strokeWidth: 1 });
  });

  test('a feature-specific style overrides the default on conflicting keys', () => {
    const segments: Segments<GeoSegmentStyle> = {
      default: [{ style: { fill: 'grey', strokeWidth: 1 } }],
      argentina: [{ style: { fill: 'tomato' } }],
    };
    // fill overridden by the feature-specific entry; strokeWidth still inherited from default.
    expect(resolveFeatureStyle<GeoSegmentStyle>(segments, 'argentina')).toEqual({ fill: 'tomato', strokeWidth: 1 });
  });

  test('multiple entries under the same key merge in order, later wins', () => {
    const segments: Segments<GeoSegmentStyle> = {
      argentina: [{ style: { fill: 'grey' } }, { style: { fill: 'tomato', strokeWidth: 2 } }],
    };
    expect(resolveFeatureStyle<GeoSegmentStyle>(segments, 'argentina')).toEqual({ fill: 'tomato', strokeWidth: 2 });
  });

  test('an entry with no style contributes nothing', () => {
    const segments: Segments<GeoSegmentStyle> = { argentina: [{}] };
    expect(resolveFeatureStyle<GeoSegmentStyle>(segments, 'argentina')).toEqual({});
  });

  test('a feature with no matching key at all falls back to an empty style', () => {
    const segments: Segments<GeoSegmentStyle> = { chile: [{ style: { fill: 'blue' } }] };
    expect(resolveFeatureStyle<GeoSegmentStyle>(segments, 'argentina')).toEqual({});
  });
});
