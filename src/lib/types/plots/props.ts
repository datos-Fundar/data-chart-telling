import type { HoverPoint, HoverStrategy, TooltipOptions } from '$lib/types/layout/tooltip';
import type { Segment } from '$lib/types/plots/segments/config';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { GeoScalesConfig } from '$lib/types/layout/coordinates';

/** The `styles` prop accepted by every plot kind — its own
 * styles shape ({@link AxisBasedStylesConfig}, `GeoStylesConfig`, …). */
export type StylesConfig<TStyles extends object> = TStyles;

/** The `markers` prop accepted by every plot kind — a list of that kind's own marker union. */
export type MarkersConfig<TMarker> = TMarker[];

/**
 * The `segments` prop accepted by every plot kind — series name (or
 * `'default'` for all series) to a list of {@link Segment}s. Within a
 * series, catch-all segments (no `areas`) evaluate first as a baseline;
 * area-specific segments merge on top and win on conflict.
 */
export type SegmentsConfig<TStyle> = Record<string, Segment<TStyle>[]>;

/**
 * Partial margin override — unset sides fall back to the theme (itself
 * `'auto'` by default). `'auto'` fits the side to its rendered content; a
 * number pins it exactly.
 */
export type MarginConfig = Partial<{
  top: number | 'auto';
  right: number | 'auto';
  bottom: number | 'auto';
  left: number | 'auto'
}>;

/**
 * The `tooltip` prop a plot actually receives — the resolved form of the
 * author-facing {@link TooltipOptions}. `format`/`sync` become required;
 * `facetId` identifies the originating facet (`''` when not faceted).
 * Presence of this object is what turns hovering on.
 */
export type TooltipConfig<TRow extends Record<string, unknown>> = Omit<TooltipOptions<TRow>, 'format' | 'sync'> & {
  format: (row: TRow) => string;
  sync: boolean;
  facetId: string;
};

/** How a pointer event resolves to a candidate point: `'nearest'` (closest within a distance threshold) or `'contains'` (whichever candidate's own rendered shape contains the cursor). */
export type PointMatchingStrategy = 'nearest' | 'contains';

/** `BasePlotLayout`'s single `hover` prop — every plot kind's own resolved hover/tooltip wiring. */
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
  /** When it returns `true`, that pointer event is treated as a leave instead of a move — lets a nested layout opt part of the plot out of hover matching. */
  exclude?: (e: PointerEvent) => boolean;
  /** How to resolve a pointer event to a candidate point — see {@link PointMatchingStrategy}. Defaults to `'nearest'`. */
  pointMatching?: PointMatchingStrategy;
  /** Forces the crosshair rule(s) a `hover` marker draws off entirely, overriding whatever `strategy` implies. */
  crosshair?: boolean;
};

/**
 * The `scales` prop accepted by every plot kind — either flavor of scale
 * config a plot kind can have. Each concrete `Plot.svelte` narrows
 * `BasePlotProps`'s `TScales` to exactly the one that applies to it.
 */
export type ScalesConfig<TData = Record<string, unknown>> =
  | AxisBasedScalesConfig<TData>
  | GeoScalesConfig;

/**
 * The shared prop bag every plot component accepts, parameterized over
 * everything that varies by plot kind: `TDataContract` is its own data
 * shape, `TRow` is what `tooltip` resolves against, and the rest are its
 * own segment/style/marker/scale/coordinate-system shapes. `TCoordinates`
 * defaults to `undefined` — only `GeoPlot` instantiates it.
 */
export type BasePlotProps<
  TDataContract,
  TRow extends Record<string, unknown>,
  TStyles extends object,
  TSegmentStyle extends object,
  TMarker,
  TScales extends ScalesConfig<TRow>,
  TCoordinates = undefined,
> = TDataContract & {
  width: number;
  height: number;
  styles?: StylesConfig<TStyles>;
  segments?: SegmentsConfig<TSegmentStyle>;
  markers?: MarkersConfig<TMarker>;
  scales?: TScales;
  coordinates?: TCoordinates;
  margins?: MarginConfig;
  tooltip?: TooltipConfig<TRow>;
};
