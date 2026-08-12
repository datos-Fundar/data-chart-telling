import type { ValueAnchor } from '$lib/types/plots/constants';
import type { FontStyle, StrokeStyle } from '$lib/types/plots/styling';
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
  /** Called with the numeric value and the series name. Return a string to render. */
  format?: (value: number, seriesName: string) => string;
  /** Text styling for the label itself. */
  fontStyle?: FontStyle;
  /**
   * Style for the leader line drawn from a label displaced to clear an
   * overlap with another series' label, back to its real data point.
   * Labels only ever move when they'd otherwise collide — this is a no-op
   * style until that happens. Falls back to a neutral grey, thin, solid
   * stroke — deliberately not the series' own colour or stroke width, since
   * matching the data line reads as more data rather than as a leader,
   * right where several lines are already converging. Unset fields keep
   * that fallback.
   */
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
 * Top-level rendering style overrides shared by the non-geo plot kinds.
 * Passed as the `styles` prop. Each plot reads only the fields it cares
 * about.
 */
export type BasePlotStylesConfig = {
  values?: ValuesStyle;
  colors?: ColorsStyle;
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
  [key: string]: unknown;
};
