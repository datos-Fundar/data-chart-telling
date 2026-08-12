import type { Snippet } from 'svelte';
import type { Accessor } from '$lib/types/plots/data/common';
import type { AreaStyle, StrokeStyle } from '$lib/types/plots/styling';
import type { GeoFeature, GeoJsonInput } from '$lib/types/plots/data/geo';
import type { GeoSegmentStyle } from '$lib/types/plots/segments/common';
import type { GeoProjectionName } from '$lib/types/layout/coordinates';
import type { BaseMarkersConfig } from './base';

/** Longitude/latitude gridlines — svelteplot's `Graticule`. */
export type GeoGraticuleMarkerConfig = {
  type: 'graticule';
  step?: number;
  stepX?: number;
  stepY?: number;
  style?: StrokeStyle;
  /** Renders behind the base map's own fill/stroke instead of on top of it (markers otherwise draw over the base map). */
  behind?: boolean;
};

/** The outer globe outline (for orthographic-type projections) — svelteplot's `Sphere`. */
export type GeoSphereMarkerConfig = {
  type: 'sphere';
  style?: StrokeStyle & { fill?: string; fillOpacity?: number };
  /** Renders behind the base map's own fill/stroke instead of on top of it — needed when `style.fill` is set. */
  behind?: boolean;
};

/**
 * Arrows/spikes at points — svelteplot's `Vector`.
 * https://svelteplot.dev/examples/vector/shift-map
 */
export type GeoVectorMarkerConfig<TRow extends Record<string, unknown> = Record<string, unknown>> = {
  type: 'vector';
  data: TRow[];
  x: Accessor<TRow, number>;
  y: Accessor<TRow, number>;
  length?: Accessor<TRow, number> | number;
  rotate?: Accessor<TRow, number> | number;
  shape?: 'arrow' | 'spike' | 'arrow-filled';
  anchor?: 'start' | 'middle' | 'end';
  style?: { fill?: string; stroke?: string; strokeWidth?: number };
};

/**
 * Geodesic-aware lines between point pairs — svelteplot's `Link` (its
 * `curve: 'auto'` traces a great-circle arc on a geographic projection).
 * https://svelteplot.dev/examples/link/spherical-link
 */
export type GeoLinkMarkerConfig<TRow extends Record<string, unknown> = Record<string, unknown>> = {
  type: 'link';
  data: TRow[];
  x1: Accessor<TRow, number>;
  y1: Accessor<TRow, number>;
  x2: Accessor<TRow, number>;
  y2: Accessor<TRow, number>;
  curve?: 'auto' | 'linear';
  style?: StrokeStyle;
};

/**
 * Marching-squares contours from a scalar field — svelteplot's `Contour`.
 * https://svelteplot.dev/examples/contour/weather
 *
 * Two input modes: pass `data` (+ `x`/`y`/`value` row accessors) to
 * spatially interpolate a scatter of samples, or omit `data` and pass
 * `value` as an `(x, y) => number` sampling function.
 */
export type GeoContourMarkerConfig<TRow extends Record<string, unknown> = Record<string, unknown>> = {
  type: 'contour';
  data?: TRow[];
  x?: Accessor<TRow, number>;
  y?: Accessor<TRow, number>;
  value?: Accessor<TRow, number> | ((x: number, y: number) => number);
  thresholds?: number | number[];
  fill?: 'value' | string;
  stroke?: 'value' | string;
  blur?: number;
  interpolate?: 'none' | 'nearest' | 'barycentric' | 'random-walk';
  style?: { strokeWidth?: number; fillOpacity?: number; strokeOpacity?: number };
  /** Masks the contour to just the base map's landmass (`'land'`) or water (`'ocean'`). */
  clip?: 'land' | 'ocean';
  /** Renders behind the base map's own fill/stroke instead of on top of it. */
  behind?: boolean;
};

/**
 * The in-map hover highlight — restyles the hovered feature's own shape.
 * Its own `type: 'geo-hover'` tag (rather than the axis-based `'hover'`)
 * keeps it unambiguous: both configs are all-optional, so an author writing
 * `{ type: 'hover' }` for a `GeoPlot` would otherwise be structurally
 * indistinguishable from the axis-based marker.
 */
export type GeoHoverMarkerConfig = {
  type: 'geo-hover';
  style?: AreaStyle;
};

/**
 * Mounts an arbitrary Svelte component as a mark — the geo analog of
 * `CustomComponentMarkerConfig` (no `series` concept here). Its own
 * `type: 'geo-component'` tag (rather than the axis-based `'component'`)
 * keeps the two unambiguous at `GeometryLayout`'s dispatch — same reasoning
 * as `GeoHoverMarkerConfig`'s `'geo-hover'` tag.
 */
export type GeoCustomComponentMarkerConfig = {
  type: 'geo-component';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any;
  props?: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any[];
};

/**
 * Which edge of the plot frame an inset is anchored to, and where along it
 * — a `side-anchor` pair in either word order (`'bottom-right'` ==
 * `'right-bottom'`). `side` is `top`/`bottom`/`left`/`right`; `anchor` is
 * the same four plus `middle`.
 */
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

/** Named projections an `inset` marker can use, minus `'identity'`/`'reflect-y'`, which have no scale/translate to auto-fit. */
export type GeoInsetProjectionName = Exclude<GeoProjectionName, 'identity' | 'reflect-y'>;

/**
 * Independent hover tooltip scoped to just one `inset` marker's own rendered
 * features, matched by nearest projected centroid within the inset's own
 * local mini-projection. Decoupled from the plot's own top-level `tooltip`.
 */
export type GeoInsetTooltipConfig = {
  /** Tooltip text for the nearest feature (by centroid) to the cursor, within this inset. */
  format: (feature: GeoFeature<Record<string, unknown>>) => string;
  /** Custom tooltip body; replaces `format` when given. */
  content?: Snippet<[{ rows: GeoFeature<Record<string, unknown>>[] }]>;
};

/** Projection config for an `inset` marker — like `GeoProjectionConfig`, minus `inset`/`domain` (insets always auto-fit to their own content) and custom factories (which can't guarantee `fitExtent`). */
export type GeoInsetProjectionConfig =
  | GeoInsetProjectionName
  | {
      type?: GeoInsetProjectionName;
      rotate?: [number, number] | [number, number, number];
      center?: [number, number];
      parallels?: [number, number];
      clip?: boolean | null | number | 'frame';
    };

/**
 * A small, independently-projected map panel anchored to a corner/edge of
 * the plot, showing a region at a different scale than the main map. Shows
 * either a filtered subset of the plot's own `data` (via `features`) or a
 * wholly separate dataset (`data`, which takes precedence when both are
 * given).
 */
export type GeoInsetMarkerConfig<TProps extends Record<string, unknown> = Record<string, unknown>> = {
  type: 'inset';
  location: GeoInsetLocation;
  /** Feature ids (matching the plot's own `featureId`) to filter from the plot's own `data`. Ignored when `data` is set. */
  features?: string[];
  /**
   * Narrows each `features`-matched feature to just the geometry parts that
   * pass this predicate — same signature as `GeoDataProps.excludeParts`, so
   * one feature's geometry can be split between the main map and this inset.
   * Ignored when `data` is set.
   */
  featurePartsFilter?: (
    part: { centroid: [number, number]; geometry: GeoJSON.Geometry },
    feature: GeoFeature<TProps> & { __id: string },
  ) => boolean;
  /** A separate GeoJSON dataset rendered inside the inset instead of a filtered subset of the plot's own `data`. TopoJSON isn't supported here. */
  data?: GeoJsonInput<TProps>;
  /** Projection for just this inset, independently fit to whatever it ends up showing. Defaults to `'mercator'`. */
  projection?: GeoInsetProjectionConfig;
  /** Inset box size as a fraction of the plot's own width/height. Defaults to `0.26`/`0.22`. */
  width?: number;
  height?: number;
  /** Gap between the inset box and the plot's own edge, in pixels. Defaults to `8`. */
  margin?: number;
  style?: GeoSegmentStyle;
  /** Independent hover tooltip for just this inset's own rendered features — see `GeoInsetTooltipConfig`. */
  tooltip?: GeoInsetTooltipConfig;
};

/**
 * `GeoPlot`'s own `markers` prop type — unions {@link BaseMarkersConfig} with
 * every geo-only kind. Independent of `AxisBasedMarkersConfig`
 * (`types/markers/common.ts`): geo has no axis to `rule` against, and its
 * `hover`/`component` variants differ in shape from the axis-based kinds'.
 */
export type GeoMarkersConfig =
  | BaseMarkersConfig
  | GeoGraticuleMarkerConfig
  | GeoSphereMarkerConfig
  | GeoVectorMarkerConfig
  | GeoLinkMarkerConfig
  | GeoContourMarkerConfig
  | GeoHoverMarkerConfig
  | GeoCustomComponentMarkerConfig
  | GeoInsetMarkerConfig;

/**
 * The base choropleth/base-map mark — one per distinct resolved feature
 * style. Never author-facing: `buildGeoMarkers` builds it from `GeoPlot`'s
 * own `styleGroups`.
 */
export type GeoFeaturesMarkerConfig = {
  type: 'geo';
  data: Record<string, unknown>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fill: (d: any) => string;
  fillOpacity?: number;
  stroke?: string;
  strokeWidth?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onclick?: (e: Event, d: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onpointerenter?: (e: Event, d: any) => void;
  onpointerleave?: (e: Event) => void;
};
