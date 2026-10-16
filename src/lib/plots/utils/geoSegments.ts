import type { ChannelScalesConfig } from '$lib/types/layout/scales';
import type { Segment } from '$lib/types/plots/segments/config';
import type { SegmentsConfig } from '$lib/types/plots/props';

const DEFAULT_KEY = 'default';

/**
 * Feature-specific segments listed after 'default' so they override it on
 * merge (see `resolveFeatureStyle`). When the feature has a resolved
 * `grouping` bucket, that bucket's own entries are listed in between -
 * `default` < grouping bucket < feature-specific, most specific last.
 */
export function resolveSegmentsForFeature<TStyle>(
	segments: SegmentsConfig<TStyle>,
	featureId: string,
	groupingValue?: string
): Segment<TStyle>[] {
	return [
		...(segments[DEFAULT_KEY] ?? []),
		...(groupingValue ? (segments[groupingValue] ?? []) : []),
		...(segments[featureId] ?? [])
	];
}

/**
 * A geo feature is atomic - `Segment.areas` (x/y range restriction) doesn't
 * apply, so every entry under a key is treated as a flat style patch applied
 * in order: `'default'` entries apply first, then the grouping bucket's (if
 * any), then feature-specific entries. This intentionally does NOT reuse
 * `segments.ts`'s `validateSegments` - its "only the first catch-all wins"
 * warning assumes area-based semantics that don't hold here, since every geo
 * segment entry merges rather than being dropped.
 */
export function resolveFeatureStyle<TStyle extends object>(
	segments: SegmentsConfig<TStyle>,
	featureId: string,
	groupingValue?: string
): TStyle {
	return resolveSegmentsForFeature(segments, featureId, groupingValue).reduce(
		(acc, seg) => ({ ...acc, ...(seg.styles ?? {}) }),
		{} as TStyle
	);
}

/**
 * A feature's own effective `scales` override, if any of its matching
 * segments (`default`, its grouping bucket, or itself) set one - the last
 * (most specific) entry that defines `scales` wins outright, unlike
 * `resolveFeatureStyle`'s field-by-field merge, since a ramp config isn't
 * sensibly mergeable key-by-key (a `domain` from one entry and a `scheme`
 * from another wouldn't be a coherent scale).
 */
export function resolveFeatureScales<TStyle>(
	segments: SegmentsConfig<TStyle>,
	featureId: string,
	groupingValue?: string
): ChannelScalesConfig | undefined {
	return resolveSegmentsForFeature(segments, featureId, groupingValue).reduce<
		ChannelScalesConfig | undefined
	>((acc, seg) => seg.scales ?? acc, undefined);
}
