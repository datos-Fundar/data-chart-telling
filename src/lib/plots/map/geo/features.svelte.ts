import { isTopology, topologyToGeoJson } from '$lib/plots/utils/topojson';
import type { GeoFeature, GeoJsonInput, Topology } from '$lib/types/plots/data/geo';

/** A GeoPlot's `data` as a feature list: GeoJSON as is, a TopoJSON `Topology` converted under `object`. */
export function createGeoFeatures<TProps extends Record<string, unknown>>(
	getData: () => GeoJsonInput<TProps> | Topology,
	getObject: () => string | undefined
) {
	let topoFeatures = $state<GeoFeature<TProps>[] | null>(null);

	$effect(() => {
		const data = getData();
		const object = getObject();
		if (!isTopology(data)) return;
		if (!object) {
			console.warn(
				'GeoPlot: `data` is a TopoJSON Topology but no `object` key was given - nothing will render.'
			);
			topoFeatures = [];
			return;
		}
		let cancelled = false;
		topologyToGeoJson<TProps>(data, object)
			.then((resolved) => {
				if (!cancelled) topoFeatures = resolved;
			})
			.catch((err) => {
				if (!cancelled) {
					console.warn(err instanceof Error ? err.message : String(err));
					topoFeatures = [];
				}
			});
		return () => {
			cancelled = true;
		};
	});

	const features = $derived.by((): GeoFeature<TProps>[] => {
		const data = getData();
		if (isTopology(data)) return topoFeatures ?? [];
		if (Array.isArray(data)) return data;
		return data.features as GeoFeature<TProps>[];
	});

	return {
		get features() {
			return features;
		}
	};
}
