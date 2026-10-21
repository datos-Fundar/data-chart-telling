import type { Accessor } from '$lib/types/plots/data/common';
import type { GeoFeature } from '$lib/types/plots/data/geo';
import type { ColorScaleConfig } from '$lib/types/layout/scales';
import type { GeoScalesConfig } from '$lib/types/layout/coordinates';
import type { SegmentsConfig, MarginConfig, HoverConfig } from '$lib/types/plots/props';
import type { HoverPosition } from '$lib/types/phases';
import type { TooltipProp } from '$lib/types/layout/tooltip';
import type { GeoSegmentStyle } from '$lib/types/plots/segments/common';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import type { MarkerConfig } from '$lib/types/markers/all';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { LegendDisabledStyle } from '$lib/types/layout/legend';

/** One feature tagged with its resolved id/centroid as plain fields. */
export type TaggedGeoFeature<TProps extends Record<string, unknown>> = GeoFeature<TProps> & {
	__id: string;
	__cx: number;
	__cy: number;
};

/** One resolved-style bucket of features - `opacity` is a second bucketing dimension alongside `style`, quantized so the channel produces a bounded number of mark instances. */
export type GeoStyleGroup<TProps extends Record<string, unknown>> = {
	style: GeoSegmentStyle;
	opacity: number | undefined;
	data: TaggedGeoFeature<TProps>[];
};

/** The active continuous-legend range filter, if any - mirrors HeatmapPlot's own. */
export type GeoRangeFilter = {
	min: number;
	max: number;
	mode: 'rescale' | 'filter';
	disabledStyle: LegendDisabledStyle;
};

/** GeoPlot's shared pipeline state - raw props plus every phase's own output. */
export type GeoPlotState<TProps extends Record<string, unknown>> = {
	/** Already resolved to plain GeoJSON - TopoJSON's async conversion happens in `Plot.svelte` itself, before the pipeline runs. */
	rawFeatures: GeoFeature<TProps>[];
	featureId?: Accessor<GeoFeature<TProps>, string>;
	/** Color-value accessor - see `GeoDataProps.color`. */
	color?: (feature: GeoFeature<TProps>) => number | undefined;
	/** Structural grouping-bucket accessor - see `GeoDataProps.grouping`. */
	grouping?: (feature: GeoFeature<TProps>) => string | undefined;
	/** Opacity-value accessor - see `GeoDataProps.opacity`. */
	opacity?: (feature: GeoFeature<TProps>) => number | undefined;
	excludeParts?: (
		part: { centroid: [number, number]; geometry: GeoJSON.Geometry },
		feature: TaggedGeoFeature<TProps>
	) => boolean;
	segments: SegmentsConfig<GeoSegmentStyle>;
	scales: GeoScalesConfig;
	/** The plot's `tooltip`, which the "hover" phase reads. */
	tooltip?: TooltipProp<TaggedGeoFeature<TProps>>;
	/** The raw `markers` prop - GeoPlot interleaves it with the base map by draw order, not a plain append. */
	authoredMarkers: GeoMarkersConfig[];
	width: number;
	height: number;
	margins?: MarginConfig;

	// "data" phase output.
	allFeatures?: TaggedGeoFeature<TProps>[];
	features?: TaggedGeoFeature<TProps>[];

	/** "scales" phase output: the `[min, max]` the color ramp spans, before any legend range narrows it - `undefined` without a `color`. */
	colorDomain?: [number, number];
	/** "scales" phase output: the ramp of each segment that sets its own `scales.color`, over just its own features. */
	colorRamps?: { name: string; domain: [number, number]; scale: ColorScaleConfig }[];
	/** "scales" phase output: the `[min, max]` of the `opacity` values - `undefined` without an `opacity`. */
	opacityDomain?: [number, number];
	/** "scales" phase output: each feature's own resolved color, composed from `color` and the color ramp - `undefined` where `color` itself is unset/returns nothing. */
	resolveColor?: (feature: GeoFeature<TProps>) => string | undefined;
	/** "scales" phase output: each feature's own resolved opacity, composed from `opacity` and the opacity ramp - `undefined` where `opacity` itself is unset/returns nothing. */
	resolveOpacity?: (feature: GeoFeature<TProps>) => number | undefined;

	// "markers" phase output - full draw-order merge with `authoredMarkers`.
	markers?: MarkerConfig[];
	styleGroups?: GeoStyleGroup<TProps>[];
	/** "tooltip" phase output: how a hovered feature reads, unless `tooltip.format` says otherwise. */
	tooltipFormat?: (feature: GeoFeature<TProps>) => string;

	// "hover" phase output: what the pointer can match, the features drawn and hovered, and where each sits.
	hover?: HoverConfig<TaggedGeoFeature<TProps>>;
	hoverPosition?: HoverPosition;
	hoverRows?: TaggedGeoFeature<TProps>[];
};

/** The environment every GeoPlot phase reads from, alongside the growing state. */
export type GeoPlotCtx<TProps extends Record<string, unknown>> = {
	cfg: PlotStylesConfig;
	range: GeoRangeFilter | null | undefined;
	fill?: string;
	fillOpacity?: number;
	stroke?: string;
	strokeWidth?: number;
	onFeatureClick?: (d: TaggedGeoFeature<TProps>, e: Event) => void;
};
