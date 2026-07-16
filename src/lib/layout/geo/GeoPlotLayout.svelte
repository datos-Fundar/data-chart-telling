<script lang="ts" generics="TFeature extends Record<string, unknown>">
  import type { ComponentProps, Snippet } from 'svelte';
  import { Plot, Pointer } from 'svelteplot';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { numericMargin } from '$lib/layout/plot/margins';
  import { getHover, createHover } from '$lib/layout/tooltip/hover.svelte';
  import { createHoverController } from '$lib/layout/tooltip/controller.svelte';
  import HoverMarker from '$lib/plots/markers/HoverMarker.svelte';
  import Tooltip from '$lib/layout/tooltip/Tooltip.svelte';
  import TileLayer from '$lib/plots/geo/TileLayer.svelte';
  import { createGeoZoom } from '$lib/plots/geo/zoom.svelte';
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
    top: numericMargin('top', margins?.top ?? cfg.margins.top),
    right: numericMargin('right', margins?.right ?? cfg.margins.right),
    bottom: numericMargin('bottom', margins?.bottom ?? cfg.margins.bottom),
    left: numericMargin('left', margins?.left ?? cfg.margins.left),
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
  const geoZoom = createGeoZoom({
    enabled: () => zoomEnabled,
    config: () => zoomConfig,
    node: () => containerEl ?? null,
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
  <Plot
    {width}
    {height}
    margin={numericMargins}
    projection={resolvedProjection as ComponentProps<typeof Plot>['projection']}
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
