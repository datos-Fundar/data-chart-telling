import { resolveAccessor } from '$lib/utils/accessors';
import {
	geometryCentroid,
	filterGeometryParts,
	defaultFeatureId
} from '$lib/plots/utils/geoAccessors';
import type { GeoFeature } from '$lib/types/plots/data/geo';
import type { GeoPlotState, TaggedGeoFeature } from '$lib/types/plots/geo/state';

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
		: defaultFeatureId<TProps>;

	const allFeatures: TaggedGeoFeature<TProps>[] = rawFeatures.map((f) => {
		const [cx, cy] = geometryCentroid(f.geometry);
		return { ...f, __id: getFeatureId(f), __cx: cx, __cy: cy } as TaggedGeoFeature<TProps>;
	});

	const features: TaggedGeoFeature<TProps>[] = !excludeParts
		? allFeatures
		: allFeatures.flatMap((f) => {
				const geometry = filterGeometryParts(f.geometry, (part) => !excludeParts(part, f));
				if (!geometry) return [];
				const [cx, cy] = geometryCentroid(geometry);
				return [{ ...f, geometry, __cx: cx, __cy: cy } as TaggedGeoFeature<TProps>];
			});

	return { ...state, allFeatures, features };
}
