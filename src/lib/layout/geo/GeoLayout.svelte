<script lang="ts">
  import type { Snippet } from 'svelte';
  import TileLayer from '$lib/plots/geo/TileLayer.svelte';
  import type { GeoTileLayerConfig } from '$lib/types/plots/styles/geo';

  /**
   * Geo-only chrome nested inside `BasePlotLayout` (the `GeoPlot` analog of
   * `ScalesLayout`/`GeometryLayout`) — just the pan/zoom transform
   * group and the raster tile layer underneath the map's own marks.
   * Everything else GeoPlot used to duplicate from `BasePlotLayout` (the hover
   * state machine, `<Plot>` itself, `<Pointer>`, the tooltip) now lives
   * exclusively in `BasePlotLayout`; the zoom/rotate *gesture* state itself lives
   * in `GeoPlot`'s own `Plot.svelte` (it also feeds the projection's
   * `rotate`, which has to reach `BasePlotLayout`'s `<Plot projection>` prop —
   * something a component nested *inside* that same `<Plot>` has no way to
   * reach back out to), and is only handed down here as an already-resolved
   * `zoomTransform` to apply.
   */
  let {
    width,
    height,
    numericMargins,
    zoomTransform,
    tileLayer,
    dataLonLatBounds,
    children,
  }: {
    width: number;
    height: number;
    numericMargins: { top: number; right: number; bottom: number; left: number };
    zoomTransform: { x: number; y: number; k: number };
    tileLayer?: GeoTileLayerConfig;
    /** Forwarded to `TileLayer` — see `Plot.svelte`'s `dataLonLatBounds`. */
    dataLonLatBounds?: [number, number, number, number] | null;
    children: Snippet;
  } = $props();
</script>

<g transform="translate({zoomTransform.x}, {zoomTransform.y}) scale({zoomTransform.k})">
  {#if tileLayer}
    <TileLayer
      config={tileLayer}
      left={numericMargins.left}
      top={numericMargins.top}
      width={Math.max(0, width - numericMargins.left - numericMargins.right)}
      height={Math.max(0, height - numericMargins.top - numericMargins.bottom)}
      {dataLonLatBounds}
    />
  {/if}
  {@render children()}
</g>
