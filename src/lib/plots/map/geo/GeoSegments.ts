import type { ChannelScalesConfig } from '$lib/types/layout/scales';
import type { Segment } from '$lib/types/plots/segments/config';
import type { SegmentsConfig } from '$lib/types/plots/props';

/**
 * The segments that apply to one geo feature. A feature is atomic, so a segment's
 * `areas` do not apply: every entry is a plain patch, merged in order.
 */
export class GeoSegments {
	static readonly #DEFAULT_KEY = 'default';

	/** The feature's entries, least specific first: `default`, its grouping bucket, then itself. */
	static forFeature<TStyle>(
		segments: SegmentsConfig<TStyle>,
		featureId: string,
		groupingValue?: string
	): Segment<TStyle>[] {
		return [
			...(segments[GeoSegments.#DEFAULT_KEY] ?? []),
			...(groupingValue ? (segments[groupingValue] ?? []) : []),
			...(segments[featureId] ?? [])
		];
	}

	/** Every matching entry's `styles` merged field by field, the most specific winning. */
	static style<TStyle extends object>(
		segments: SegmentsConfig<TStyle>,
		featureId: string,
		groupingValue?: string
	): TStyle {
		return GeoSegments.forFeature(segments, featureId, groupingValue).reduce(
			(merged, segment) => ({ ...merged, ...(segment.styles ?? {}) }),
			{} as TStyle
		);
	}

	/** The `scales` of the most specific matching entry that sets one: a ramp config does not merge key by key. */
	static scales<TStyle>(
		segments: SegmentsConfig<TStyle>,
		featureId: string,
		groupingValue?: string
	): ChannelScalesConfig | undefined {
		return GeoSegments.forFeature(segments, featureId, groupingValue).reduce<
			ChannelScalesConfig | undefined
		>((found, segment) => segment.scales ?? found, undefined);
	}
}
