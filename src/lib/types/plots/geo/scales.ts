/**
 * The projection names svelteplot's `<Plot projection>` accepts as a string
 * (svelteplot itself doesn't export this as a type — defined here so authors
 * get autocomplete/type-checking over the full supported set).
 */
export type GeoProjectionName =
  | 'albers-usa'
  | 'albers'
  | 'azimuthal-equal-area'
  | 'azimuthal-equidistant'
  | 'conic-conformal'
  | 'conic-equal-area'
  | 'conic-equidistant'
  | 'equal-earth'
  | 'equirectangular'
  | 'gnomonic'
  | 'identity'
  | 'reflect-y'
  | 'mercator'
  | 'orthographic'
  | 'stereographic'
  | 'transverse-mercator';

import type { GeoProjection } from 'd3-geo';

/**
 * What a custom projection factory (e.g. `argentinaBicontinental` under
 * `$lib`'s geo projections) must return — just enough of d3's `GeoProjection`
 * for svelteplot to stream marks through it and invert pointer coordinates
 * back to lon/lat. Deliberately narrower than importing `GeoProjection`
 * itself, since a hand-tuned custom projection may not implement its full
 * surface (e.g. no single `scale`/`translate` describing it).
 */
export type GeoCustomProjection = Pick<GeoProjection, 'stream'> & Partial<Pick<GeoProjection, 'invert'>>;

/**
 * A custom projection factory, usable as `scales.projection.type` alongside
 * (instead of) a `GeoProjectionName`. svelteplot calls this with the plot's
 * inner width/height (already net of margins/insets) and expects a
 * ready-to-use projection back.
 */
export type GeoCustomProjectionFactory = (opts: { width: number; height: number }) => GeoCustomProjection;

export type GeoProjectionConfig =
  | GeoProjectionName
  | {
      type?: GeoProjectionName | GeoCustomProjectionFactory;
      rotate?: [number, number] | [number, number, number];
      center?: [number, number] | [number, number, number];
      parallels?: [number, number] | [number, number, number];
      inset?: number;
      clip?: boolean | null | number | 'frame';
      /**
       * Fits the projection's scale/translate to this GeoJSON object's extent
       * instead of the projection's own default (whole-world-sized) framing,
       * regardless of which named projection is active. Also what makes
       * `'identity'`/`'reflect-y'` (which otherwise have no scale/translate of
       * their own — they pass lon/lat through as-is) size themselves to fill
       * the plot. Pass `'data'` to fit to whatever was already given to the
       * plot's own `data` prop, instead of repeating it here.
       */
      domain?: GeoJSON.GeoJsonObject | GeoJSON.FeatureCollection | GeoJSON.Feature | 'data';
    };

export type GeoScalesConfig = {
  /** Which map projection to draw with. Defaults to `'equal-earth'`. */
  projection?: GeoProjectionConfig;
  /** Continuous choropleth value domain — mirrors heatmap's `scales.z.domain`. */
  color?: {
    domain?: [number, number];
  };
};
