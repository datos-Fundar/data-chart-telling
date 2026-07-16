import type { Accessor } from '$lib/types/plots/common';
import type { DotStyle, FontStyle, StrokeStyle, ColorsStyle } from '$lib/types/plots/styles';
import type { HoverDisplayPoint } from '$lib/types/layout/tooltip';
import type { GeoFeature, GeoJsonInput } from '$lib/types/plots/geo/common';
import type { GeoSegmentStyle } from '$lib/types/plots/geo/styles';
import type { GeoProjectionName } from '$lib/types/plots/geo/scales';

/** Longitude/latitude gridlines — svelteplot's `Graticule`. */
export type GeoGraticuleMarker = {
  type: 'graticule';
  step?: number;
  stepX?: number;
  stepY?: number;
  style?: StrokeStyle;
};

/** The outer globe outline (for orthographic-type projections) — svelteplot's `Sphere`. */
export type GeoSphereMarker = {
  type: 'sphere';
  style?: StrokeStyle & { fill?: string; fillOpacity?: number };
};

/**
 * Point markers by longitude/latitude, sized/colored by value —
 * svelteplot's `Dot`. https://svelteplot.dev/examples/dot/weather
 */
export type GeoDotMarker<TRow extends Record<string, unknown> = Record<string, unknown>> = {
  type: 'dot';
  data: TRow[];
  x: Accessor<TRow, number>;
  y: Accessor<TRow, number>;
  r?: Accessor<TRow, number> | number;
  /** Continuous value used to color each dot through a ramp — see `style.colors`. */
  value?: Accessor<TRow, number>;
  style?: DotStyle & { colors?: ColorsStyle };
};

/**
 * Arrows/spikes at points — svelteplot's `Vector`.
 * https://svelteplot.dev/examples/vector/shift-map
 */
export type GeoVectorMarker<TRow extends Record<string, unknown> = Record<string, unknown>> = {
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
export type GeoLinkMarker<TRow extends Record<string, unknown> = Record<string, unknown>> = {
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
export type GeoContourMarker<TRow extends Record<string, unknown> = Record<string, unknown>> = {
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
};

/**
 * The in-map hover highlight. `strategy` chooses which candidate point set
 * drives matching: `'nearest-feature'` (base-map feature centroids —
 * choropleth-style hover) or `'nearest-point'` (a `dot` marker's own rows).
 */
export type GeoHoverMarkerConfig = {
  type: 'hover';
  strategy?: 'nearest-feature' | 'nearest-point';
  showLabels?: boolean;
  format?: (point: HoverDisplayPoint) => string;
  dotStyle?: DotStyle;
  fontStyle?: FontStyle;
};

/** Mounts an arbitrary Svelte component as a mark — the geo analog of `CustomComponentMarker` (no `series` concept here). */
export type GeoCustomComponentMarker = {
  type: 'component';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any;
  props?: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any[];
};

/**
 * Which edge of the plot frame an inset is anchored to, and where along that
 * edge — a `side-anchor` pair joined by `-`, in either word order (so
 * `'bottom-right'` and `'right-bottom'` are the same corner). `side` is
 * `top`/`bottom`/`left`/`right`; `anchor` is the same four plus `middle`
 * (e.g. `'right-middle'` centers the inset vertically along the right edge).
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

/**
 * Named projections an `inset` marker can use for its own independently-fit
 * mini-map — everything `GeoProjectionName` offers except `'identity'`/
 * `'reflect-y'`, which have no scale/translate of their own to fit (see
 * `GeoProjectionConfig.domain`'s doc comment) and so can't auto-fit the way
 * every inset needs to.
 */
export type GeoInsetProjectionName = Exclude<GeoProjectionName, 'identity' | 'reflect-y'>;

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
 * the plot — for showing a region at a different, more legible scale than
 * the main map (a disjoint territory, a dense metro area, etc.), the way
 * national mapping agencies commonly draw insets for exactly this reason.
 *
 * What it shows is either a filtered subset of the plot's own `data` (via
 * `features`, matched the same way `segments` keys are) or a wholly
 * separate dataset (`data`, which takes precedence over `features` when
 * both are given) — the inset's own mini-projection is fit to whichever one
 * applies, independently of the main map's projection/zoom.
 */
export type GeoInsetMarker<TProps extends Record<string, unknown> = Record<string, unknown>> = {
  type: 'inset';
  location: GeoInsetLocation;
  /** Feature ids (matching the plot's own `featureId`) to filter from the plot's own `data`. Ignored when `data` is set. */
  features?: string[];
  /**
   * Narrows each `features`-matched feature down to just the geometry parts
   * that pass this predicate (each polygon of a `MultiPolygon`, each line of
   * a `MultiLineString`) — same `(part, feature)` signature as
   * `GeoDataProps.excludeParts`, so the same predicate can be passed to both
   * to split one feature's geometry between the main map and this inset
   * without preprocessing the source data. Omitted → every part of each
   * matched feature renders, as before. Ignored when `data` is set.
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
};

export type GeoMarker =
  | GeoGraticuleMarker
  | GeoSphereMarker
  | GeoDotMarker
  | GeoVectorMarker
  | GeoLinkMarker
  | GeoContourMarker
  | GeoHoverMarkerConfig
  | GeoCustomComponentMarker
  | GeoInsetMarker;
