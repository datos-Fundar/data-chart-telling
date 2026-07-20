import type { TooltipOptions } from '$lib/types/layout/tooltip';
import type { Segment } from '$lib/types/plots/segments/config';
import type { AxisScale } from '$lib/types/plots/axis';
import type { GeoProjectionConfig } from '$lib/types/plots/scales/geo';

/** The `styles` prop accepted by every plot kind — its own
 * styles shape ({@link BasePlotStyles}, `GeoStyles`, …). */
export type StylesConfig<TStyles extends object> = TStyles;

/** The `markers` prop accepted by every plot kind — a list of that
 * kind's own marker union ({@link Marker}, `GeoMarker`, …). */
export type MarkersConfig<TMarker> = TMarker[];

/**
 * The `segments` prop accepted by every plot kind.
 *
 * A record mapping series names (or `'default'` for all series) to lists of
 * {@link Segment}s. Segments in a named key apply only to that series;
 * segments under `'default'` apply to every series.
 *
 * ```ts
 * segments: {
 *   female:  [{ style: { stroke: { stroke: 'tomato' } } }],   // catch-all for female
 *   male:    [{ style: { stroke: { stroke: 'steelblue' } } }], // catch-all for male
 *   default: [{ areas: [{ x: { from: 2012, to: 2014 } }], style: { dots: { dotSymbol: 'circle' } } }],
 * }
 * ```
 *
 * Within each resolved series list, catch-alls (no `areas`) are evaluated last
 * so that area-specific segments always override them, regardless of position.
 * Area-specific segments also inherit any style key absent from their own style
 * by merging the catch-all as a baseline — the area's own style wins on conflict.
 * This lets you set a series colour once in a catch-all and add per-range dots
 * or dash patterns without repeating the colour on every area segment.
 */
export type SegmentsConfig<TStyle> = Record<string, Segment<TStyle>[]>;

/**
 * Partial margin override — only the sides you specify are overridden; the
 * rest come from the theme (which itself defaults every side to `'auto'`).
 * `'auto'` sizes that side to fit its rendered content (tick labels, axis
 * title, rotated ticks); a number pins it exactly.
 */
export type MarginConfig = Partial<{
  top: number | 'auto';
  right: number | 'auto';
  bottom: number | 'auto';
  left: number | 'auto'
}>;

/**
 * The `tooltip` prop a plot actually receives — the chart's resolved form of
 * the author-facing {@link TooltipOptions} (which a chart accepts as a bare
 * `boolean` or the full object via `TooltipProp`): `format`/`sync` become
 * required once resolved, and `facetId` identifies the originating facet
 * (`''` when not faceted). Presence of this object on a plot is what turns
 * hovering on.
 */
export type TooltipConfig<TRow extends Record<string, unknown>> = Omit<TooltipOptions<TRow>, 'format' | 'sync'> & {
  format: (row: TRow) => string;
  sync: boolean;
  facetId: string;
};

/**
 * Per-axis scale overrides, passed as a single `scales` prop to every
 * axis-based plot kind (`GeoPlot` uses {@link GeoScalesConfig} instead — a
 * map has no x/y/z axis pair). `TData` threads through to
 * {@link AxisScale.sort} on each axis.
 */
export type AxisBasedScalesConfig<TData = Record<string, unknown>> = {
  x?: AxisScale<TData>;
  y?: AxisScale<TData>;
  z?: AxisScale<TData>;
};

/**
 * `scales` prop for GeoPlot — the geo analog of {@link AxisBasedScalesConfig}.
 * A map has no x/y/z axis pair, so this configures the projection and the
 * choropleth colour domain instead.
 */
export type GeoScalesConfig = {
  /** Which map projection to draw with. Defaults to `'equal-earth'`. */
  projection?: GeoProjectionConfig;
  /** Continuous choropleth value domain — mirrors heatmap's `scales.z.domain`. */
  color?: { domain?: [number, number] };
};

/**
 * The `scales` prop accepted by every plot kind — either flavor of scale
 * config a plot kind can have ({@link AxisBasedScalesConfig} for the
 * axis-based kinds, {@link GeoScalesConfig} for `GeoPlot`). Each concrete
 * `Plot.svelte` narrows `BasePlotProps`'s `TScales` to exactly the one
 * that applies to it, rather than accepting this whole union.
 */
export type ScalesConfig<TData = Record<string, unknown>> = 
  | AxisBasedScalesConfig<TData>
  | GeoScalesConfig;

/**
 * The shared "prop bag" every plot component accepts, parameterized over
 * everything that varies by plot kind: `TDataContract` is the kind's own
 * data shape ({@link SeriesProps}`|`{@link DataProps} for the axis-based
 * kinds, `GeoDataProps` for `GeoPlot`), `TRow` is what `tooltip` resolves
 * against, and `TStyles`/`TSegmentStyle`/`TMarker`/`TScales` are that kind's
 * own segment/style/marker/scale shapes. Each `Plot.svelte` instantiates
 * this directly with its own concrete arguments rather than going through a
 * shared per-kind alias — segments/styles/markers already diverge in shape
 * across kinds today (or will soon), so a shared alias would just be an
 * extra layer to keep in sync.
 */
export type BasePlotProps<
  TDataContract,
  TRow extends Record<string, unknown>,
  TStyles extends object,
  TSegmentStyle extends object,
  TMarker,
  TScales extends ScalesConfig<TRow>,
> = TDataContract & {
  width: number;
  height: number;
  styles?: StylesConfig<TStyles>;
  segments?: SegmentsConfig<TSegmentStyle>;
  markers?: MarkersConfig<TMarker>;
  scales?: TScales;
  margins?: MarginConfig;
  tooltip?: TooltipConfig<TRow>;
};
