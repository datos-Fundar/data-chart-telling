<script lang="ts" generics="TFeature extends Record<string, unknown>">
  import type { ComponentProps, Snippet } from 'svelte';
  import { Plot, Pointer } from 'svelteplot';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { numericMargin, GEO_MARGIN_ESTIMATE } from '$lib/layout/plot/margins';
  import { getHover, createHover } from '$lib/layout/tooltip/hover.svelte';
  import { createHoverController } from '$lib/layout/tooltip/controller.svelte';
  import HoverMarker from '$lib/plots/markers/HoverMarker.svelte';
  import Tooltip from '$lib/layout/tooltip/Tooltip.svelte';
  import TileLayer from '$lib/plots/geo/TileLayer.svelte';
  import { createGeoZoom } from '$lib/plots/geo/zoom.svelte';
  import { createGeoRotate, type GeoRotate } from '$lib/plots/geo/rotate.svelte';
  import { resolveProjection } from './resolveProjection';
  import type { MarginConfig } from '$lib/types/plots/common';
  import type { GeoProjectionConfig } from '$lib/types/plots/geo/scales';
  import type { GeoTileLayerConfig, GeoZoomConfig } from '$lib/types/plots/geo/styles';
  import type { GeoHoverMarkerConfig } from '$lib/types/plots/geo/markers';
  import type { HoverPoint, TooltipRuntime } from '$lib/types/layout/tooltip';

  /**
   * Geo-specific chrome wrapper — the `GeoPlot` analog of `PlotLayout`. Not a
   * reuse of `PlotLayout`: that component is built around linear/ordinal x/y
   * axes (ticks, grid, axis components) that don't apply to a map, whose
   * screen position instead comes from a `d3-geo` projection via svelteplot's
   * own `<Plot projection>`. It does reuse the same hover/tooltip primitives
   * (`createHoverController`, the shared hover store, `Tooltip.svelte`).
   */
  let {
    width,
    height,
    margins,
    projection,
    data,
    getX,
    getY,
    hoverPoints,
    label,
    tooltip = undefined,
    hoverMarker = undefined,
    zoom = false,
    tileLayer,
    children,
  }: {
    width: number;
    height: number;
    margins?: MarginConfig;
    projection?: GeoProjectionConfig;
    /** Flat candidate rows fed to svelteplot's `<Pointer>` for nearest-match hover. */
    data: TFeature[];
    getX: (d: TFeature) => number;
    getY: (d: TFeature) => number;
    hoverPoints: HoverPoint<TFeature>[];
    label: (d: TFeature) => string;
    tooltip?: TooltipRuntime<TFeature>;
    hoverMarker?: GeoHoverMarkerConfig;
    zoom?: boolean | GeoZoomConfig;
    tileLayer?: GeoTileLayerConfig;
    children: Snippet<[{ matchedPoints: HoverPoint<TFeature>[] }]>;
  } = $props();

  const cfg = $derived(getConfiguration());

  const numericMargins = $derived({
    top: numericMargin('top', margins?.top, GEO_MARGIN_ESTIMATE),
    right: numericMargin('right', margins?.right, GEO_MARGIN_ESTIMATE),
    bottom: numericMargin('bottom', margins?.bottom, GEO_MARGIN_ESTIMATE),
    left: numericMargin('left', margins?.left, GEO_MARGIN_ESTIMATE),
  });

  const resolvedProjection = $derived(resolveProjection(projection, data));

  // ── Hover / tooltip ─────────────────────────────────────────────────────
  const hoverActive = $derived(tooltip != null || hoverMarker != null);

  const sharedHover = getHover();
  const localHover = createHover();
  const hover = $derived(sharedHover ?? localHover);

  $effect(() => {
    if (sharedHover) return;
    // Geo hover is inherently 2-D — always exact-match, never x-only/y-only.
    localHover.strategy = 'punctual';
    localHover.sync = tooltip?.sync ?? false;
  });

  const ctrl = createHoverController<TFeature>({
    hover: () => hover,
    facetId: () => tooltip?.facetId ?? '',
    points: () => hoverPoints,
    getX: () => getX,
    getY: () => getY,
    label: () => label,
    format: () => tooltip?.format ?? label,
    seriesFilter: () => tooltip?.series,
    width: () => width,
    height: () => height,
  });

  // ── Pan / zoom ──────────────────────────────────────────────────────────
  let containerEl: HTMLDivElement | undefined = $state();
  const zoomEnabled = $derived(zoom !== false && zoom != null);
  const zoomConfig = $derived(typeof zoom === 'object' ? zoom : undefined);

  /**
   * Orthographic (and other azimuthal, hemisphere-style) projections don't
   * gain anything from drag-to-*pan* — panning just slides the same globe a
   * few pixels within the frame — so when `zoom` is enabled on one, drag
   * instead rotates the globe (`createGeoRotate`) and wheel/pinch keeps
   * scaling it (`createGeoZoom`, with its own drag disabled below so the two
   * gestures don't fight over the same pointer events).
   */
  const projectionType = $derived(
    typeof resolvedProjection === 'string' ? resolvedProjection : resolvedProjection?.type,
  );
  const rotateEnabled = $derived(zoomEnabled && projectionType === 'orthographic');
  const baseRotate = $derived.by((): GeoRotate => {
    const configured = typeof resolvedProjection === 'object' ? resolvedProjection?.rotate : undefined;
    return [configured?.[0] ?? 0, configured?.[1] ?? 0, configured?.[2] ?? 0];
  });

  const geoZoom = createGeoZoom({
    enabled: () => zoomEnabled,
    config: () => zoomConfig,
    node: () => containerEl ?? null,
    disableDrag: () => rotateEnabled,
  });

  const geoRotate = createGeoRotate({
    enabled: () => rotateEnabled,
    baseRotate: () => baseRotate,
    scale: () => geoZoom.transform.k,
    node: () => containerEl ?? null,
  });

  const finalProjection = $derived.by(() => {
    if (!rotateEnabled) return resolvedProjection;
    return {
      ...(typeof resolvedProjection === 'string' ? { type: resolvedProjection } : resolvedProjection),
      rotate: geoRotate.rotate,
    };
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="dct-geo-plot"
  bind:this={containerEl}
  style:color={cfg.axis.color}
  style:touch-action={zoomEnabled ? 'none' : undefined}
  onpointermove={hoverActive ? ctrl.onMove : undefined}
  onpointerleave={hoverActive ? ctrl.onLeave : undefined}
>
  <!--
    Pins the plot's generic linear x/y scales to the full lon/lat range.
    Every geo-aware mark (Geo, Dot, Vector, Link, …) bypasses these entirely
    when a projection is active, routing through it instead — except
    svelteplot's own `Contour` mark, whose scatter/sampler-mode grid is
    hardcoded to read `plot.scales.x`/`y` (see `Contour.svelte`) regardless
    of any active projection. Left unset, that scale would auto-fit to just
    the contour data's own point extent — a different frame than the
    projection's own (typically whole-world) fit, so the contour would sit
    at the wrong scale/position relative to the map under it. Pinning both
    to the world range only helps `contour` markers align (best exactly
    under an `equirectangular` projection, whose x/y truly are linear in
    lon/lat) and is a no-op for every other mark type.
  -->
  <Plot
    {width}
    {height}
    margin={numericMargins}
    projection={finalProjection as ComponentProps<typeof Plot>['projection']}
    x={{ domain: [-180, 180] }}
    y={{ domain: [90, -90] }}
  >
    <g transform="translate({geoZoom.transform.x}, {geoZoom.transform.y}) scale({geoZoom.transform.k})">
      {#if tileLayer}
        <TileLayer
          config={tileLayer}
          left={numericMargins.left}
          top={numericMargins.top}
          width={Math.max(0, width - numericMargins.left - numericMargins.right)}
          height={Math.max(0, height - numericMargins.top - numericMargins.bottom)}
        />
      {/if}
      {@render children({ matchedPoints: ctrl.points })}
    </g>

    {#if hoverActive}
      <Pointer {data} x={getX} y={getY} maxDistance={400} onupdate={ctrl.onPointer} />
    {/if}

    {#if hoverMarker}
      <HoverMarker
        data={ctrl.points}
        ruleX={null}
        ruleY={null}
        showLabels={hoverMarker.showLabels ?? true}
        format={hoverMarker.format}
        dotStyle={hoverMarker.dotStyle}
        fontStyle={hoverMarker.fontStyle}
      />
    {/if}
  </Plot>

  {#if tooltip && ctrl.showTooltip && ctrl.tooltipPosition}
    <Tooltip
      x={ctrl.tooltipPosition?.x ?? 0}
      y={ctrl.tooltipPosition?.y ?? 0}
      bounds={{ width, height }}
      plain={!!tooltip.content}
    >
      {#if tooltip.content}
        {@render tooltip.content({ rows: ctrl.matchedRows.map((p) => p.row) })}
      {:else}
        {ctrl.tooltipText}
      {/if}
    </Tooltip>
  {/if}
</div>

<style>
  .dct-geo-plot {
    position: relative;
    line-height: 0;
  }
</style>
