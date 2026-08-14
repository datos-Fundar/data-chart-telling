import type { ValueAnchor } from '$lib/types/plots/constants';
import type { FontStyle, StrokeStyle, AreaStyle } from '$lib/types/plots/styling';
import type { GeoFeature } from '$lib/types/plots/data/geo';

/**
 * Controls if and how value labels are rendered on a plot. The high-level
 * `anchor` sets sensible defaults for placement; `fontStyle` (`dx`, `dy`,
 * `textAnchor`, `lineAnchor`, `lineHeight`, `rotate`, `class`, `textClass`,
 * `fill`, …) overrides those defaults field-by-field when provided — mirrors
 * {@link DeltaConfig}'s `fontStyle`/`strokeStyle` split, so label text and
 * connector-line styling never mix into one flat bag of props.
 */
export type ValuesStyle = {
  show?: boolean;
  anchor?: ValueAnchor;
  format?: (value: number, seriesName: string) => string;
  hoverIsolate?: boolean;
  fontStyle?: FontStyle;
  strokeStyle?: StrokeStyle;
};

/**
 * Color overrides for plots that derive their palette from data.
 * Each plot uses only the fields relevant to its kind; unused fields are
 * silently ignored.
 *
 * - `min` / `max` — sequential colour ramp endpoints (heatmap).
 * - `left` / `right` — diverging bar sides (pyramid).
 */
export type ColorsStyle = {
  min?: string;
  max?: string;
  left?: string;
  right?: string;
};

/**
 * Decorative border around the plot's own content box — svelteplot's
 * `Frame` mark, purely cosmetic (drawn from the box geometry, never from
 * data). `true` enables it with svelteplot's own defaults; an object
 * enables it and overrides its look field-by-field. Insets pull the frame
 * in from the content box's own edges, in pixels.
 */
export type FrameStyle = AreaStyle & {
  inset?: number;
  insetTop?: number;
  insetRight?: number;
  insetBottom?: number;
  insetLeft?: number;
};

/** Author-facing `styles.frame` prop — see {@link FrameStyle}. */
export type FrameProp = boolean | FrameStyle;

/**
 * Top-level rendering style overrides shared by the non-geo plot kinds.
 * Passed as the `styles` prop. Each plot reads only the fields it cares
 * about.
 */
export type BasePlotStylesConfig = {
  values?: ValuesStyle;
  colors?: ColorsStyle;
  /** Decorative border around the plot's content box — see {@link FrameStyle}. Available on every plot kind. */
  frame?: FrameProp;
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

/**
 * `styles` prop for GeoPlot — the geo analog of `BasePlotStylesConfig`.
 * Unlike the other plot kinds, GeoPlot's styling needs (base map, choropleth
 * ramp, tile background, click handling) are unlike anything x/y plots need,
 * so this is its own type rather than a reuse of `BasePlotStylesConfig`.
 */
export type GeoStylesConfig<TProps extends Record<string, unknown> = Record<string, unknown>> = {
  /** Base map fill, used when a feature isn't styled by `segments` or the choropleth ramp. */
  fill?: string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  /** Continuous choropleth ramp endpoints — used when `value` is provided on data. Mirrors heatmap's `styles.colors`. */
  colors?: ColorsStyle;
  /** Raster XYZ tile basemap under the vector geometry. Mercator-family projections only. */
  tileLayer?: GeoTileLayerConfig;
  /** Fired when a base-map feature is clicked. */
  onFeatureClick?: (feature: GeoFeature<TProps>, event: Event) => void;
  /** Decorative border around the plot's content box — see {@link FrameStyle}. Available on every plot kind. */
  frame?: FrameProp;
};

/**
 * `GeoTileLayerConfig`, plus `features` — never author-facing (the public
 * `styles.tileLayer` shape, {@link GeoTileLayerConfig}, doesn't declare it).
 * `GeoPlot` tacks it onto its own internal copy of `styles` so `StylesLayout`
 * can compute the tile layer's auto-fit bounds without needing raw geometry
 * threaded through as a separate prop.
 */
type GeoTileLayerConfigWithFeatures = GeoTileLayerConfig & {
  features?: { geometry: GeoJSON.Geometry }[];
};

/**
 * The minimal slice of a plot kind's own `styles` prop `StylesLayout` reads —
 * every concrete `styles` type ({@link BasePlotStylesConfig},
 * {@link GeoStylesConfig}) structurally satisfies this whether or not it
 * declares `tileLayer` at all (a missing optional field type-checks fine).
 */
export type StylesLayoutConfig = {
  tileLayer?: GeoTileLayerConfigWithFeatures;
  frame?: FrameProp;
  [key: string]: unknown;
};
