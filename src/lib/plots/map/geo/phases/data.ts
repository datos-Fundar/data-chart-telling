import { resolveAccessor } from '$lib/utils/accessors';
import { GeoGeometry } from '$lib/plots/map/geo/GeoGeometry';
import { GeoFeatures } from '$lib/plots/map/geo/GeoFeatures.svelte';
import type { GeoFeature } from '$lib/types/plots/data/geo';
import type { GeoPlotState, TaggedGeoFeature } from '$lib/types/plots/map/geo/state';

/**
 * GeoPlot's "data" phase: every feature tagged with its resolved id/centroid,
 * then reduced by `excludeParts`. Reads no ctx.
 */
export function buildData<TProps extends Record<string, unknown>>(
	state: GeoPlotState<TProps>
): GeoPlotState<TProps> {
	const { rawFeatures, featureId, excludeParts } = state;
	const getFeatureId = featureId
		? resolveAccessor<GeoFeature<TProps>>(featureId)
		: GeoFeatures.defaultId<TProps>;

	const allFeatures: TaggedGeoFeature<TProps>[] = rawFeatures.map((f) => {
		const [cx, cy] = GeoGeometry.centroid(f.geometry);
		return { ...f, __id: getFeatureId(f), __cx: cx, __cy: cy } as TaggedGeoFeature<TProps>;
	});

	const features: TaggedGeoFeature<TProps>[] = !excludeParts
		? allFeatures
		: allFeatures.flatMap((f) => {
				const geometry = GeoGeometry.filterParts(f.geometry, (part) => !excludeParts(part, f));
				if (!geometry) return [];
				const [cx, cy] = GeoGeometry.centroid(geometry);
				return [{ ...f, geometry, __cx: cx, __cy: cy } as TaggedGeoFeature<TProps>];
			});

	return { ...state, allFeatures, features };
}
