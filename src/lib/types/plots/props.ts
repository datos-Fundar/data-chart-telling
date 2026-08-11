import type { HoverPoint, HoverStrategy, TooltipOptions } from '$lib/types/layout/tooltip';
import type { Segment } from '$lib/types/plots/segments/config';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
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
 * How a hover event resolves to a candidate point:
 * - `'nearest'` — the candidate point closest to the cursor, within a
 *   distance threshold (svelteplot's own `<Pointer>`). The right choice for
 *   discrete marks positioned at exact coordinates (a line's dots, a bar's
 *   center) where "closest" and "the mark you're pointing at" coincide.
 * - `'contains'` — the candidate whose own rendered shape actually contains
 *   the cursor. The right choice when candidates are irregular filled
 *   regions (`GeoPlot`'s features) — a shape's true center can sit far from
 *   where the cursor is on a large or oddly-shaped feature, so "nearest
 *   center" and "the feature you're pointing at" routinely diverge. Backed
 *   by the browser's own SVG hit-testing on each candidate's rendered path,
 *   via the `setHoverMatch`/`clearHoverMatch` handlers `BasePlotLayout`
 *   hands back through its `children` snippet, rather than an approximation
 *   by distance to a centroid.
 */
export type HoverMatchStrategy = 'nearest' | 'contains';

/**
 * `BasePlotLayout`'s single `hover` prop — every plot kind's own resolved
 * hover/tooltip wiring (previously eight separate, always-passed-together
 * props: `hoverPoints`, `label`, `tooltip`, `hoverActive`, `hoverStrategy`,
 * `hoverSync`, `excludeHover`, `disablePointerMatch`) bundled into one
 * config, since every `Plot.svelte` computes and forwards the whole group
 * as a unit anyway.
 */
export type HoverConfig<TRow extends Record<string, unknown>> = {
  /** Whether the pointer/hover/tooltip machinery should mount at all. */
  active: boolean;
  /** Candidate points hover matching searches against. */
  points: HoverPoint<TRow>[];
  /** Short label drawn next to the highlight dot (e.g. the value). */
  label: (row: TRow) => string;
  /** Resolved hover strategy for the *local* hover store (ignored once a shared store is in scope). */
  strategy?: HoverStrategy;
  /** Resolved sync flag for the *local* hover store (ignored once a shared store is in scope). */
  sync?: boolean;
  tooltip?: TooltipConfig<TRow>;
  /**
   * When it returns `true` for a pointer event, that event is treated as a
   * leave instead of a move — lets a nested layout (e.g. GeoLayout's inset
   * markers) opt specific screen regions out of this plot's own hover
   * matching without `BasePlotLayout` needing to know why.
   */
  exclude?: (e: PointerEvent) => boolean;
  /** How to resolve a pointer event to a candidate point — see {@link HoverMatchStrategy}. Defaults to `'nearest'`. */
  match?: HoverMatchStrategy;
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
