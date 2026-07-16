import type { ColorsStyle } from '$lib/types/plots/styles';
import type { GeoFeature } from '$lib/types/plots/geo/common';

/** Per-feature styling override — the geo analog of `CellSegmentStyle`. */
export type GeoSegmentStyle = {
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
};

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

export type GeoZoomConfig = {
  min?: number;
  max?: number;
  initial?: { x?: number; y?: number; k?: number };
};

/**
 * `styles` prop for GeoPlot — the geo analog of `PlotStyles`. Unlike the
 * other plot kinds, GeoPlot's styling needs (base map, choropleth ramp, tile
 * background, zoom, click handling) are unlike anything x/y plots need, so
 * this is its own type rather than a reuse of `PlotStyles`.
 */
export type GeoStyles<TProps extends Record<string, unknown> = Record<string, unknown>> = {
  /** Base map fill, used when a feature isn't styled by `segments` or the choropleth ramp. */
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  /** Continuous choropleth ramp endpoints — used when `value` is provided on data. Mirrors heatmap's `styles.colors`. */
  colors?: ColorsStyle;
  /** Raster XYZ tile basemap under the vector geometry. Mercator-family projections only. */
  tileLayer?: GeoTileLayerConfig;
  /** `true`/config enables drag-pan + scroll-zoom. Omitted/`false` = static map. */
  zoom?: boolean | GeoZoomConfig;
  /** Fired when a base-map feature is clicked. */
  onFeatureClick?: (feature: GeoFeature<TProps>, event: Event) => void;
};
