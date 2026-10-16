import type { Snippet } from 'svelte';
import type { GeoFeature, GeoJsonInput } from '$lib/types/plots/data/geo';
import type { GeoSegmentStyle } from '$lib/types/plots/segments/common';
import type { GeoProjectionName } from '$lib/types/layout/coordinates';
import type { TooltipAnchorX, TooltipAnchorY } from '$lib/types/layout/tooltip';

/** Which frame edge an inset is anchored to, and where along it. */
export type GeoInsetLocation =
	| 'top-left'
	| 'left-top'
	| 'top-middle'
	| 'middle-top'
	| 'top-right'
	| 'right-top'
	| 'middle-left'
	| 'left-middle'
	| 'middle-middle'
	| 'middle-right'
	| 'right-middle'
	| 'bottom-left'
	| 'left-bottom'
	| 'bottom-middle'
	| 'middle-bottom'
	| 'bottom-right'
	| 'right-bottom';

/** Named projections an inset can use, minus those with no scale to auto-fit. */
export type GeoInsetProjectionName = Exclude<GeoProjectionName, 'identity' | 'reflect-y'>;

/** Projection for an inset; insets always auto-fit to their own content. */
export type GeoInsetProjectionConfig =
	| GeoInsetProjectionName
	| {
			type?: GeoInsetProjectionName;
			rotate?: [number, number] | [number, number, number];
			center?: [number, number];
			parallels?: [number, number];
			clip?: boolean | null | number | 'frame';
	  };

/** An inset's own hover tooltip, matched by nearest projected centroid. */
export type GeoInsetTooltipConfig = {
	format: (feature: GeoFeature<Record<string, unknown>>) => string;
	content?: Snippet<[{ rows: GeoFeature<Record<string, unknown>>[] }]>;
	anchorX?: TooltipAnchorX;
	anchorY?: TooltipAnchorY;
};

/** A small, independently projected map panel anchored to an edge of the plot. */
export type GeoInsetMarkerConfig<TProps extends Record<string, unknown> = Record<string, unknown>> =
	{
		type: 'inset';
		location: GeoInsetLocation;
		/** Feature ids to filter from the plot's own `data`; ignored when `data` is set. */
		features?: string[];
		/** Narrows each matched feature to the geometry parts that pass this predicate. */
		featurePartsFilter?: (
			part: { centroid: [number, number]; geometry: GeoJSON.Geometry },
			feature: GeoFeature<TProps> & { __id: string }
		) => boolean;
		/** A separate GeoJSON dataset rendered inside the inset. */
		data?: GeoJsonInput<TProps>;
		projection?: GeoInsetProjectionConfig;
		/** Inset width and height as fractions of the plot's own. */
		width?: number;
		height?: number;
		/** Gap between the inset and the plot's edge, in pixels. */
		margin?: number;
		styles?: GeoSegmentStyle;
		tooltip?: GeoInsetTooltipConfig;
	};
