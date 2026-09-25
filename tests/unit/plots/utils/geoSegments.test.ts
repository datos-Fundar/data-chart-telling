import { describe, test, expect } from 'vitest';
import { resolveSegmentsForFeature, resolveFeatureStyle } from '$lib/plots/utils/geoSegments';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { GeoSegmentStyle } from '$lib/types/plots/segments/common';

// ── resolveSegmentsForFeature ──────────────────────────────────────────────────

describe('resolveSegmentsForFeature', () => {
  test('returns an empty list when no segments are configured', () => {
    expect(resolveSegmentsForFeature({}, 'argentina')).toEqual([]);
  });

  test('returns only default entries when the feature has no specific key', () => {
    const segments: SegmentsConfig<GeoSegmentStyle> = { default: [{ styles: { fill: 'grey' } }] };
    expect(resolveSegmentsForFeature(segments, 'chile')).toEqual([{ styles: { fill: 'grey' } }]);
  });

  test('returns only feature-specific entries when there is no default', () => {
    const segments: SegmentsConfig<GeoSegmentStyle> = { argentina: [{ styles: { fill: 'tomato' } }] };
    expect(resolveSegmentsForFeature(segments, 'argentina')).toEqual([{ styles: { fill: 'tomato' } }]);
  });

  test('default entries come first, feature-specific entries last', () => {
    const segments: SegmentsConfig<GeoSegmentStyle> = {
      default: [{ styles: { fill: 'grey' } }],
      argentina: [{ styles: { fill: 'tomato' } }],
    };
    expect(resolveSegmentsForFeature(segments, 'argentina')).toEqual([
      { styles: { fill: 'grey' } },
      { styles: { fill: 'tomato' } },
    ]);
  });

  test('a feature with an unrelated key present in segments is unaffected', () => {
    const segments: SegmentsConfig<GeoSegmentStyle> = { chile: [{ styles: { fill: 'blue' } }] };
    expect(resolveSegmentsForFeature(segments, 'argentina')).toEqual([]);
  });
});

// ── resolveFeatureStyle ─────────────────────────────────────────────────────────

describe('resolveFeatureStyle', () => {
  test('returns an empty style when no segments match', () => {
    expect(resolveFeatureStyle<GeoSegmentStyle>({}, 'argentina')).toEqual({});
  });

  test('applies the default style when no feature-specific entry exists', () => {
    const segments: SegmentsConfig<GeoSegmentStyle> = { default: [{ styles: { fill: 'grey', strokeWidth: 1 } }] };
    expect(resolveFeatureStyle<GeoSegmentStyle>(segments, 'chile')).toEqual({ fill: 'grey', strokeWidth: 1 });
  });

  test('a feature-specific style overrides the default on conflicting keys', () => {
    const segments: SegmentsConfig<GeoSegmentStyle> = {
      default: [{ styles: { fill: 'grey', strokeWidth: 1 } }],
      argentina: [{ styles: { fill: 'tomato' } }],
    };
    // fill overridden by the feature-specific entry; strokeWidth still inherited from default.
    expect(resolveFeatureStyle<GeoSegmentStyle>(segments, 'argentina')).toEqual({ fill: 'tomato', strokeWidth: 1 });
  });

  test('multiple entries under the same key merge in order, later wins', () => {
    const segments: SegmentsConfig<GeoSegmentStyle> = {
      argentina: [{ styles: { fill: 'grey' } }, { styles: { fill: 'tomato', strokeWidth: 2 } }],
    };
    expect(resolveFeatureStyle<GeoSegmentStyle>(segments, 'argentina')).toEqual({ fill: 'tomato', strokeWidth: 2 });
  });

  test('an entry with no style contributes nothing', () => {
    const segments: SegmentsConfig<GeoSegmentStyle> = { argentina: [{}] };
    expect(resolveFeatureStyle<GeoSegmentStyle>(segments, 'argentina')).toEqual({});
  });

  test('a feature with no matching key at all falls back to an empty style', () => {
    const segments: SegmentsConfig<GeoSegmentStyle> = { chile: [{ styles: { fill: 'blue' } }] };
    expect(resolveFeatureStyle<GeoSegmentStyle>(segments, 'argentina')).toEqual({});
  });
});
