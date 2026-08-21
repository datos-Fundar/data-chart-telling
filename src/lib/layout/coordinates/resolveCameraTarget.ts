/// <reference types="geojson" />
import type { GeoCameraTarget } from '$lib/types/plots/camera';

/** `GeoCameraTarget` resolved to actual geometry — `features` looked up by `__id` and unioned into one `FeatureCollection`; `undefined` if none match. */
export type ResolvedGeoCameraTarget =
	| { kind: 'point'; lon: number; lat: number }
	| { kind: 'bounds'; geometry: GeoJSON.GeoJsonObject };

export function resolveCameraTarget(
	target: GeoCameraTarget | undefined,
	features: { __id: string; geometry: GeoJSON.Geometry }[]
): ResolvedGeoCameraTarget | undefined {
	if (!target) return undefined;
	if ('center' in target) return { kind: 'point', lon: target.center[0], lat: target.center[1] };
	if ('bounds' in target) return { kind: 'bounds', geometry: target.bounds };

	const wanted = new Set(target.features);
	const matched = features.filter((f) => wanted.has(f.__id));
	if (!matched.length) return undefined;
	return {
		kind: 'bounds',
		geometry: {
			type: 'FeatureCollection',
			features: matched.map((f) => ({ type: 'Feature', properties: null, geometry: f.geometry }))
		} as GeoJSON.FeatureCollection
	};
}
