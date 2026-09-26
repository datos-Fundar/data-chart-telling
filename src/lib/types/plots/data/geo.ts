/// <reference types="geojson" />
import type { Accessor } from '$lib/types/plots/data/common';

/**
 * One GeoJSON feature, generically typed over its `properties`. Intersected
 * with `Record<string, unknown>` so it satisfies the same generic bound
 * every other row type in this package does (e.g. `TooltipConfig<TRow
 * extends Record<string, unknown>>`) — GeoJSON's own `Feature` type has no
 * index signature on its own.
 */
export type GeoFeature<TProps extends Record<string, unknown> = Record<string, unknown>> =
	GeoJSON.Feature<GeoJSON.Geometry, TProps> & Record<string, unknown>;

export type GeoJsonInput<TProps extends Record<string, unknown>> =
	| GeoJSON.FeatureCollection<GeoJSON.Geometry, TProps>
	| GeoFeature<TProps>[];

/**
 * Minimal structural shape of a TopoJSON `Topology` object. Deliberately not
 * imported from `topojson-client`'s own types, so referencing it never forces
 * module resolution of that (optional peer) package at typecheck time for
 * consumers who haven't installed it — see `$lib/plots/utils/topojson`.
 */
export type Topology = {
	type: 'Topology';
	objects: Record<string, unknown>;
	arcs: unknown[][];
	transform?: { scale: [number, number]; translate: [number, number] };
	bbox?: number[];
};

/**
 * Data contract for GeoPlot — the geo analog of {@link DataProps}/{@link SeriesProps}
 * (`$lib/types/plots/data/common`). There's no x/y axis pair for geographic data:
 * `data` IS the map.
 */
export type GeoDataProps<TProps extends Record<string, unknown> = Record<string, unknown>> = {
	/**
	 * GeoJSON is always accepted. A TopoJSON `Topology` is also accepted, but
	 * only converted at runtime if `topojson-client` is installed (an optional
	 * peer dependency) — see `object`.
	 */
	data: GeoJsonInput<TProps> | Topology;
	/**
	 * Required when `data` is a `Topology` — the key under `topology.objects`
	 * to convert via topojson-client's `feature()`. Ignored for GeoJSON input.
	 */
	object?: string;
	/**
	 * Resolves each feature's stable id — used as the `segments` lookup key
	 * (e.g. `segments.argentina`) and for hover/click identification. Defaults
	 * to `feature.id ?? feature.properties?.id ?? feature.properties?.name`.
	 */
	featureId?: Accessor<GeoFeature<TProps>, string>;
	/**
	 * Optional continuous color-value accessor for choropleth coloring — the
	 * channel driving the ramp (mirrors heatmap's `color`), configured via
	 * `scales.color`. A feature with no `color` (or when omitted entirely)
	 * falls back to `styles.fill`/`segments`.
	 */
	color?: (feature: GeoFeature<TProps>) => number | undefined;
	/**
	 * Optional structural grouping key — splits features into named buckets
	 * for `segments` to address by name (e.g. `segments.global_south`),
	 * independent of `color`. Unlike the axis-based plot kinds, this has no
	 * implicit default: `color` here is a per-feature *continuous* value, not
	 * a series-splitting key, so defaulting `grouping` to `color` would try
	 * to bucket by every distinct numeric value instead of leaving features
	 * ungrouped. A feature whose `grouping` value has no matching `segments`
	 * key simply falls through to `segments.default`/the plot-level ramp.
	 */
	grouping?: (feature: GeoFeature<TProps>) => string | undefined;
	/** Continuous or categorical opacity-value accessor — configure the ramp via `scales.opacity`. */
	opacity?: (feature: GeoFeature<TProps>) => number | undefined;
	/**
	 * Excludes matching parts of a feature's geometry from the map's own
	 * rendering and hover/click matching — e.g. so a separate `inset` marker
	 * (via its own `featurePartsFilter`) can take over showing that part
	 * elsewhere without it being drawn twice. Runs once per disjoint part of
	 * each feature's geometry (each polygon of a `MultiPolygon`, each line of
	 * a `MultiLineString`; any other geometry type is a single part). Return
	 * `true` to exclude that part — excluding every part of a feature drops
	 * it entirely, which also covers omitting a whole feature from the map.
	 * `segments` styling is unaffected (still keyed by whole-feature
	 * `featureId`, applied to whatever geometry remains).
	 */
	excludeParts?: (
		part: { centroid: [number, number]; geometry: GeoJSON.Geometry },
		feature: GeoFeature<TProps> & { __id: string }
	) => boolean;
};
