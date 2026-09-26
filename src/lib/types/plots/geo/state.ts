import type { Accessor } from '$lib/types/plots/data/common';
import type { GeoFeature } from '$lib/types/plots/data/geo';
import type { GeoScalesConfig } from '$lib/types/layout/coordinates';
import type { SegmentsConfig, MarginConfig } from '$lib/types/plots/props';
import type { GeoSegmentStyle } from '$lib/types/plots/segments/common';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import type { MarkerConfig } from '$lib/types/markers/all';
import type { ChartConfig } from '$lib/types/configuration/styling';
import type { LegendDisabledStyle } from '$lib/types/layout/legend';

/** One feature tagged with its resolved id/centroid as plain fields. */
export type TaggedGeoFeature<TProps extends Record<string, unknown>> = GeoFeature<TProps> & {
	__id: string;
	__cx: number;
	__cy: number;
};

/** One resolved-style bucket of features — `opacity` is a second bucketing dimension alongside `style`, quantized so the channel produces a bounded number of mark instances. */
export type GeoStyleGroup<TProps extends Record<string, unknown>> = {
	style: GeoSegmentStyle;
	opacity: number | undefined;
	data: TaggedGeoFeature<TProps>[];
};

/** The active continuous-legend range filter, if any — mirrors HeatmapPlot's own. */
export type GeoRangeFilter = {
	min: number;
	max: number;
	mode: 'rescale' | 'filter';
	disabledStyle: LegendDisabledStyle;
};

/** GeoPlot's shared pipeline state — raw props plus every phase's own output. */
export type GeoPlotState<TProps extends Record<string, unknown>> = {
	/** Already resolved to plain GeoJSON — TopoJSON's async conversion happens in `Plot.svelte` itself, before the pipeline runs. */
	rawFeatures: GeoFeature<TProps>[];
	featureId?: Accessor<GeoFeature<TProps>, string>;
	/** Color-value accessor — see `GeoDataProps.color`. */
	color?: (feature: GeoFeature<TProps>) => number | undefined;
	/** Structural grouping-bucket accessor — see `GeoDataProps.grouping`. */
	grouping?: (feature: GeoFeature<TProps>) => string | undefined;
	/** Opacity-value accessor — see `GeoDataProps.opacity`. */
	opacity?: (feature: GeoFeature<TProps>) => number | undefined;
	excludeParts?: (
		part: { centroid: [number, number]; geometry: GeoJSON.Geometry },
		feature: TaggedGeoFeature<TProps>
	) => boolean;
	segments: SegmentsConfig<GeoSegmentStyle>;
	scales: GeoScalesConfig;
	/** The raw `markers` prop — GeoPlot interleaves it with the base map by draw order, not a plain append. */
	authoredMarkers: GeoMarkersConfig[];
	width: number;
	height: number;
	margins?: MarginConfig;

	// "data" phase output.
	allFeatures?: TaggedGeoFeature<TProps>[];
	features?: TaggedGeoFeature<TProps>[];

	/** "scales" phase output: each feature's own resolved color, composed from `color` and the color ramp — `undefined` where `color` itself is unset/returns nothing. */
	resolveColor?: (feature: GeoFeature<TProps>) => string | undefined;
	/** "scales" phase output: each feature's own resolved opacity, composed from `opacity` and the opacity ramp — `undefined` where `opacity` itself is unset/returns nothing. */
	resolveOpacity?: (feature: GeoFeature<TProps>) => number | undefined;

	// "markers" phase output — full draw-order merge with `authoredMarkers`,
	// minus live hover pointer handlers on the base 'geo' marker(s); see
	// `attachFeatureHover`.
	markers?: MarkerConfig[];
	styleGroups?: GeoStyleGroup<TProps>[];
};

/** The environment every GeoPlot phase reads from, alongside the growing state. */
export type GeoPlotCtx<TProps extends Record<string, unknown>> = {
	cfg: ChartConfig;
	range: GeoRangeFilter | null | undefined;
	fill?: string;
	fillOpacity?: number;
	stroke?: string;
	strokeWidth?: number;
	onFeatureClick?: (d: TaggedGeoFeature<TProps>, e: Event) => void;
};
