import type { GeoProjectionConfig } from '$lib/types/layout/coordinates';

/**
 * Resolves a `GeoScalesConfig['projection']` into what svelteplot's own
 * `<Plot projection>` expects - kept separate from `GeoPlot`'s own
 * `Plot.svelte` so adding more projection-level behavior (like the
 * `domain: 'data'` sentinel below) doesn't grow that component itself.
 */
export function resolveProjection<
	TFeature extends Record<string, unknown> & { geometry?: unknown }
>(projection: GeoProjectionConfig | undefined, data: TFeature[]): GeoProjectionConfig {
	if (!projection) return 'equal-earth';
	if (typeof projection === 'string') return projection;
	const domain =
		projection.domain === 'data'
			? ({ type: 'FeatureCollection', features: data } as unknown as GeoJSON.FeatureCollection)
			: projection.domain;
	return {
		type: projection.type,
		rotate: projection.rotate,
		center: projection.center,
		parallels: projection.parallels,
		inset: projection.inset,
		clip: projection.clip,
		domain
	};
}
