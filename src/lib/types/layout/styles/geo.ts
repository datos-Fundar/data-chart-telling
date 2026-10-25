import type { GeoFeature } from '$lib/types/plots/data/geo';
import type { FrameProp } from '$lib/types/layout/styles/frame';
import type { BasePlotStylesConfig } from '$lib/types/layout/styles/base';

export type GeoTileLayerConfig = {
	/** XYZ tile URL template, e.g. `'https://tile.openstreetmap.org/{z}/{x}/{y}.png'`. */
	url: string;
	attribution?: string;
	opacity?: number;
	minZoom?: number;
	maxZoom?: number;
	/** Tile edge length in pixels. Defaults to `256`. */
	tileSize?: number;
};

/**
 * `styles` prop for GeoPlot - the geo analog of `AxisBasedStylesConfig`,
 * sharing only {@link BasePlotStylesConfig}'s common ground with it. Unlike
 * the other plot kinds, GeoPlot's styling needs (base map, choropleth ramp,
 * tile background, click handling) are unlike anything x/y plots need, so
 * this is its own type rather than a reuse of `AxisBasedStylesConfig`.
 */
export type GeoStylesConfig<TProps extends Record<string, unknown> = Record<string, unknown>> =
	BasePlotStylesConfig & {
		/** Base map fill, used when a feature isn't styled by `segments` or the choropleth ramp. */
		fill?: string;
		fillOpacity?: number;
		stroke?: string;
		strokeWidth?: number;
		/** Raster XYZ tile basemap under the vector geometry. Mercator-family projections only. */
		tileLayer?: GeoTileLayerConfig;
		/** Fired when a base-map feature is clicked. */
		onFeatureClick?: (feature: GeoFeature<TProps>, event: Event) => void;
	};

/**
 * `GeoTileLayerConfig`, plus `features` - never author-facing (the public
 * `styles.tileLayer` shape, {@link GeoTileLayerConfig}, doesn't declare it).
 * `GeoPlot` tacks it onto its own internal copy of `styles` so `StylesLayout`
 * can compute the tile layer's auto-fit bounds without needing raw geometry
 * threaded through as a separate prop.
 */
type GeoTileLayerConfigWithFeatures = GeoTileLayerConfig & {
	features?: { geometry: GeoJSON.Geometry }[];
};

/**
 * The minimal slice of a plot kind's own `styles` prop `StylesLayout` reads -
 * every concrete `styles` type ({@link AxisBasedStylesConfig},
 * {@link GeoStylesConfig}) structurally satisfies this whether or not it
 * declares `tileLayer` at all (a missing optional field type-checks fine).
 */
export type StylesLayoutConfig = {
	tileLayer?: GeoTileLayerConfigWithFeatures;
	frame?: FrameProp;
	[key: string]: unknown;
};
