import { isTopology, topologyToGeoJson } from '$lib/plots/utils/topojson';
import type { GeoFeature, GeoJsonInput, Topology } from '$lib/types/plots/data/geo';

/** A GeoPlot's `data` as a feature list: GeoJSON as is, a TopoJSON `Topology` converted under `object`. Create it while a component initializes. */
export class GeoFeatures<TProps extends Record<string, unknown>> {
	readonly #getData: () => GeoJsonInput<TProps> | Topology;
	readonly #getObject: () => string | undefined;
	#converted = $state<GeoFeature<TProps>[] | null>(null);
	readonly #list = $derived.by((): GeoFeature<TProps>[] => {
		const data = this.#getData();
		if (isTopology(data)) return this.#converted ?? [];
		if (Array.isArray(data)) return data;
		return data.features as GeoFeature<TProps>[];
	});

	constructor(getData: () => GeoJsonInput<TProps> | Topology, getObject: () => string | undefined) {
		this.#getData = getData;
		this.#getObject = getObject;
		$effect(() => this.#convert());
	}

	get features(): GeoFeature<TProps>[] {
		return this.#list;
	}

	/** The default `featureId`: `feature.id`, else `properties.id`, else `properties.name`. */
	static defaultId<TProps extends Record<string, unknown>>(feature: GeoFeature<TProps>): string {
		const props = feature.properties as Record<string, unknown> | null;
		return String(feature.id ?? props?.id ?? props?.name ?? '');
	}

	/** Converts a TopoJSON `data` into features once, dropping the result if `data` changes meanwhile. */
	#convert(): (() => void) | void {
		const data = this.#getData();
		const object = this.#getObject();
		if (!isTopology(data)) return;
		if (!object) {
			console.warn(
				'GeoPlot: `data` is a TopoJSON Topology but no `object` key was given - nothing will render.'
			);
			this.#converted = [];
			return;
		}
		let cancelled = false;
		topologyToGeoJson<TProps>(data, object)
			.then((features) => {
				if (!cancelled) this.#converted = features;
			})
			.catch((error) => {
				if (!cancelled) {
					console.warn(error instanceof Error ? error.message : String(error));
					this.#converted = [];
				}
			});
		return () => {
			cancelled = true;
		};
	}
}
