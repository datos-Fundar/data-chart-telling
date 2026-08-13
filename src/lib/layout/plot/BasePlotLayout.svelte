<script lang="ts" generics="TData extends Record<string, unknown>, TSeries extends Record<string, unknown> = TData">
  import type { ComponentProps, Snippet } from 'svelte';
  import { Plot, Pointer } from 'svelteplot';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { AUTO_MARGIN_ESTIMATE, numericMargin } from '$lib/layout/plot/margins';
  import { buildScale } from '$lib/layout/scales/buildScale';
  import ScalesLayout from '$lib/layout/scales/ScalesLayout.svelte';
  import GeometryLayout from '$lib/layout/geometry/GeometryLayout.svelte';
  import CoordinatesLayout from '$lib/layout/coordinates/CoordinatesLayout.svelte';
  import StylesLayout from '$lib/layout/styles/StylesLayout.svelte';
  import { getHover, createHover } from '$lib/layout/tooltip/hover.svelte';
  import { createHoverController } from '$lib/layout/tooltip/controller.svelte';
  import TooltipLayout from '$lib/layout/tooltip/TooltipLayout.svelte';
  import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
  import type { CoordinatesConfig } from '$lib/types/layout/coordinates';
  import type { StylesLayoutConfig } from '$lib/types/layout/styles';
  import type { ScopedMarkerGroup } from '$lib/types/layout/geometry';
  import type { HoverPoint } from '$lib/types/layout/tooltip';
  import type { MarginConfig, HoverConfig } from '$lib/types/plots/props';
  import type { MarkerConfig } from '$lib/types/markers/all';
  import type { Series } from '$lib/types/plots/data/common';
  import type { GeoFeature } from '$lib/types/plots/data/geo';

  type SveltePlotProps = ComponentProps<typeof Plot>;

  /**
   * Shared chrome around every plot kind's svelteplot markup: the
   * pointer-event wrapper, the hover/tooltip state machine, and the floating
   * tooltip. Composes the Coordinates and Styles layers around every plot
   * kind's own content, plus `GeometryLayout` (which renders nothing extra
   * when `markers` is empty/unset). `ScalesLayout` composes in
   * independently, only when `scales` is passed. Every plot kind supplies
   * its own `<Plot x y projection>` scale config, either directly via
   * `x`/`y` or by leaving them unset so this component derives them from
   * `scales`.
   */
  let {
    width,
    height,
    data,
    getX,
    getY,
    hover,
    x = undefined,
    y = undefined,
    scales = undefined,
    coordinates = undefined,
    margins,
    marginEstimate = AUTO_MARGIN_ESTIMATE,
    xTickRotate = undefined,
    styles = undefined,
    markers = undefined,
    seriesData = undefined,
    scopedGroups = undefined,
    geoAllFeatures = undefined,
    containerEl = $bindable(undefined),
    children,
  }: {
    width: number;
    height: number;
    /** Flat rows fed to svelteplot's `<Pointer>` for nearest-point matching, and to `CoordinatesLayout` for a `domain: 'data'` projection auto-fit. */
    data: TData[];
    getX: (d: TData) => AxisValue;
    getY: (d: TData) => AxisValue;
    /** Every hover/tooltip prop this component's own hover machinery reads — see {@link HoverConfig}. */
    hover: HoverConfig<TData>;
    /** Explicit `<Plot x>` override — bypasses `scales`-derived resolution (e.g. GeoPlot's fixed lon/lat domain). */
    x?: SveltePlotProps['x'];
    /** Explicit `<Plot y>` override — see `x`. */
    y?: SveltePlotProps['y'];
    /** Scale config `x`/`y` are derived from when not given directly. */
    scales?: AxisBasedScalesConfig<TData>;
    /** This plot kind's coordinate system config — `GeoPlot` only (a projection + pan/zoom). */
    coordinates?: CoordinatesConfig;
    /** Partial margin override — merged on top of the theme. */
    margins?: MarginConfig;
    /** Numeric fallback for a margin side that resolved to `'auto'` — see `numericMargin`'s doc comment. */
    marginEstimate?: Record<'top' | 'right' | 'bottom' | 'left', number>;
    /** Boosts the bottom margin for a rotated x tick label — axis-having plot kinds only. */
    xTickRotate?: number;
    /** This plot kind's own `styles` prop, forwarded to the Styles layer. */
    styles?: StylesLayoutConfig;
    /**
     * This plot kind's own markers array. Accepts a plain array, or a
     * builder function for a plot kind whose own marker construction needs
     * `setHoverMatch`/`clearHoverMatch`, only available once this
     * component's own hover controller is set up.
     */
    markers?:
      | MarkerConfig[]
      | ((hover: { setHoverMatch: (rows: TData[]) => void; clearHoverMatch: () => void }) => MarkerConfig[]);
    /** All resolved series, forwarded to `GeometryLayout` — axis-based kinds only. Independently generic over `TSeries` (defaults to `TData`). */
    seriesData?: Series<TSeries>[];
    /** Per-series `GeometryLayout` groups — axis-based kinds only, same `TSeries` as `seriesData`. */
    scopedGroups?: ScopedMarkerGroup<TSeries>[];
    /** `GeoPlot`'s own untouched, tagged features, forwarded to `GeometryLayout` — `inset` marker only. */
    geoAllFeatures?: (GeoFeature<Record<string, unknown>> & { __id: string })[];
    /** The wrapper div's own element — bind for a nested layout that needs it for its own gesture handling (e.g. `CoordinatesLayout`'s zoom/rotate). */
    containerEl?: HTMLDivElement;
    /**
     * `matchedPoints` carries the source `row` alongside the display fields,
     * so a template can resolve it straight off `row` instead of assuming
     * which visual axis it landed on. `activePoint` is the one matched point
     * under the cursor. `numericMargins` lets a nested layout align itself
     * with the plot's own content box. `setHoverMatch`/`clearHoverMatch` let
     * a plot kind drive the match itself instead of svelteplot's
     * distance-based `<Pointer>` — see `hover.pointMatching`. When `markers`
     * is given, this is `GeometryLayout`'s own `children` instead of raw
     * plot content. Optional — a plot kind whose every mark is a `markers`
     * entry has nothing left to render here.
     */
    children?: Snippet<
      [{
        matchedPoints: HoverPoint<TData>[];
        activePoint: HoverPoint<TData> | null;
        impliesCrosshairX: boolean;
        impliesCrosshairY: boolean;
        numericMargins: { top: number; right: number; bottom: number; left: number };
        setHoverMatch: (rows: TData[]) => void;
        clearHoverMatch: () => void;
      }]
    >;
  } = $props();

  const cfg = $derived(getConfiguration());

  /**
   * Margins passed straight to `<Plot margin={…}>`. Each side defaults to
   * `'auto'` (from the theme), which lets svelteplot size it to whatever it
   * actually renders there — tick labels, an axis title, rotated ticks —
   * rather than a fixed guess that either clips content or wastes space.
   * `margins`/`cfg.margins` can still pin a side to an exact number.
   */
  const computedMargins = $derived.by(() => {
    const base = { ...cfg.margins, ...margins };
    // Auto margins already measure the real (rotated) label bounding box, so
    // this manual boost is only needed when the caller pinned bottom to a
    // fixed number, which bypasses that measurement.
    if (!xTickRotate || typeof base.bottom !== 'number') return base;
    const rad = Math.abs(xTickRotate) * Math.PI / 180;
    return {
      ...base,
      bottom: base.bottom + Math.ceil(Math.sin(rad) * 20),
    };
  });

  const numericMargins = $derived({
    top: numericMargin('top', computedMargins.top, marginEstimate),
    right: numericMargin('right', computedMargins.right, marginEstimate),
    bottom: numericMargin('bottom', computedMargins.bottom, marginEstimate),
    left: numericMargin('left', computedMargins.left, marginEstimate),
  });

  // Cast to svelteplot's own (narrower, axis-specific) scale option type:
  // buildScale has already stripped the fields that don't exist there
  // (grid, the vertical label config, BarPlot's series-layout knobs).
  const resolvedX = $derived(x !== undefined ? x : (buildScale(scales?.x, data, getX) as SveltePlotProps['x']));
  const resolvedY = $derived(y !== undefined ? y : (buildScale(scales?.y, data, getY) as SveltePlotProps['y']));

  /** Only ever meaningful for `GeoPlot` — every other kind leaves `coordinates` unset. */
  const touchAction = $derived(coordinates?.zoom !== false && coordinates?.zoom != null ? 'none' : undefined);

  // ── Hover / tooltip ───────────────────────────────────────────────────────
  const sharedHover = getHover();
  const localHover = createHover();
  const hoverStore = $derived(sharedHover ?? localHover);

  /** Declared intent, defaulted — see {@link HoverConfig.pointMatching}. */
  const pointMatchingStrategy = $derived(hover.pointMatching ?? 'nearest');

  /**
   * Which axes svelteplot's `<Pointer>` should search along, derived from
   * the active strategy. `undefined` for an axis collapses every point to
   * the same coordinate on that axis, excluding it from the match entirely.
   */
  const pointerMatchX = $derived(hoverStore.strategy === 'y' ? undefined : getX);
  const pointerMatchY = $derived(hoverStore.strategy === 'x' ? undefined : getY);

  $effect(() => {
    if (sharedHover) return;
    localHover.strategy = hover.strategy ?? 'x';
    localHover.sync = hover.sync ?? false;
  });

  const ctrl = createHoverController<TData>({
    hover: () => hoverStore,
    facetId: () => hover.tooltip?.facetId ?? '',
    points: () => hover.points,
    getX: () => getX,
    getY: () => getY,
    label: () => hover.label,
    seriesFilter: () => hover.tooltip?.series,
    width: () => width,
    height: () => height,
  });

  function onMove(e: PointerEvent) {
    if (hover.exclude?.(e)) {
      ctrl.onLeave();
      return;
    }
    ctrl.onMove(e);
  }

  const resolvedMarkers = $derived(
    typeof markers === 'function' ? markers({ setHoverMatch: ctrl.onPointer, clearHoverMatch: ctrl.onLeave }) : markers,
  );

  /** `hover.crosshair === false` forces both off, overriding the strategy-implied default — see {@link HoverConfig.crosshair}. */
  const effectiveImpliesCrosshairX = $derived(hover.crosshair === false ? false : ctrl.impliesCrosshairX);
  const effectiveImpliesCrosshairY = $derived(hover.crosshair === false ? false : ctrl.impliesCrosshairY);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="dct-plot"
  bind:this={containerEl}
  style:color={cfg.axis.color}
  style:touch-action={touchAction}
  onpointermove={hover.active ? onMove : undefined}
  onpointerleave={hover.active ? ctrl.onLeave : undefined}
>
  <CoordinatesLayout
    {width}
    {height}
    margin={computedMargins}
    x={resolvedX}
    y={resolvedY}
    {coordinates}
    {data}
    {containerEl}
  >
    <StylesLayout {styles} {width} {height} {numericMargins} />
    {#if scales !== undefined}
      <ScalesLayout {data} {getX} {getY} {width} {height} {numericMargins} {scales} />
    {/if}
    <GeometryLayout
      markers={resolvedMarkers}
      seriesData={seriesData ?? []}
      scopedGroups={scopedGroups ?? []}
      matchedPoints={ctrl.points}
      activePoint={ctrl.activePoint}
      impliesCrosshairX={effectiveImpliesCrosshairX}
      impliesCrosshairY={effectiveImpliesCrosshairY}
      {width}
      {height}
      {numericMargins}
      {data}
      {geoAllFeatures}
      tooltipAnchorX={hover.tooltip?.anchorX}
      tooltipAnchorY={hover.tooltip?.anchorY}
    >
      {@render children?.({
        matchedPoints: ctrl.points,
        activePoint: ctrl.activePoint,
        impliesCrosshairX: effectiveImpliesCrosshairX,
        impliesCrosshairY: effectiveImpliesCrosshairY,
        numericMargins,
        setHoverMatch: ctrl.onPointer,
        clearHoverMatch: ctrl.onLeave,
      })}
    </GeometryLayout>

    {#if hover.active && pointMatchingStrategy === 'nearest'}
      <Pointer {data} x={pointerMatchX} y={pointerMatchY} maxDistance={400} onupdate={ctrl.onPointer} />
    {/if}
  </CoordinatesLayout>

  {#if hover.tooltip}
    <TooltipLayout
      visible={ctrl.showTooltip && ctrl.tooltipPosition != null}
      x={ctrl.tooltipPosition?.x ?? 0}
      y={ctrl.tooltipPosition?.y ?? 0}
      bounds={{ width, height }}
      rows={ctrl.matchedRows.map((p) => p.row)}
      format={hover.tooltip.format}
      content={hover.tooltip.content}
      anchorX={hover.tooltip.anchorX}
      anchorY={hover.tooltip.anchorY}
    />
  {/if}
</div>

<style>
  .dct-plot {
    position: relative;
    line-height: 0;
  }
</style>
