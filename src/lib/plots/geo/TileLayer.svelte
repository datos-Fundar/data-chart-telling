<script lang="ts">
  import { usePlot } from 'svelteplot';
  import {
    visibleTiles,
    buildMercatorFit,
    tileScreenBounds,
    tileUrl,
    toProjectionLike,
    type StreamingProjection,
  } from '$lib/plots/utils/tiles';
  import type { GeoTileLayerConfig } from '$lib/types/plots/styles/geo';

  /**
   * Renders an XYZ raster tile basemap under the vector geometry. Mounted as
   * a child of svelteplot's `<Plot>` so `usePlot()` resolves its already-fit
   * projection — this module never depends on `d3-geo` directly.
   *
   * v1 limitation: the visible tile grid is computed once for the initial
   * view, not re-fetched as the pan/zoom `<g>` transform changes — tiles pan
   * and scale visually with the map, but don't reveal new coverage when
   * panned far, and pixelate past their native resolution when zoomed in.
   */
  let {
    config,
    left,
    top,
    width,
    height,
    dataLonLatBounds,
  }: {
    config: GeoTileLayerConfig;
    left: number;
    top: number;
    width: number;
    height: number;
    /** Forwarded to `visibleTiles`/`buildMercatorFit` — see `Plot.svelte`'s `dataLonLatBounds`. */
    dataLonLatBounds?: [number, number, number, number] | null;
  } = $props();

  const plot = usePlot();

  const tileSize = $derived(config.tileSize ?? 256);

  // svelteplot's own `PlotScale` type doesn't reflect this, but at runtime
  // `scales.projection` is `createProjection()`'s `{ stream, invert }`
  // result (verified against svelteplot's own `helpers/projection.js`).
  const rawProjection = $derived(plot.scales.projection as unknown as StreamingProjection | undefined);
  const projection = $derived(rawProjection ? toProjectionLike(rawProjection) : undefined);

  const tiles = $derived.by(() => {
    if (!projection) return [];
    return visibleTiles(
      projection,
      { left, top, width, height },
      tileSize,
      config.minZoom ?? 0,
      config.maxZoom ?? 19,
      dataLonLatBounds,
    );
  });

  // One affine fit per zoom level, shared across every tile in `tiles` — see
  // `buildMercatorFit`'s doc comment for why this replaces forward-projecting
  // each tile's own corners individually.
  const fit = $derived.by(() => {
    if (!projection || tiles.length === 0) return null;
    return buildMercatorFit(projection, { left, top, width, height }, tiles[0].z, dataLonLatBounds);
  });
</script>

{#if projection && fit}
  <g class="dct-geo-tiles" opacity={config.opacity ?? 1}>
    {#each tiles as tile (`${tile.z}/${tile.x}/${tile.y}`)}
      {@const bounds = tileScreenBounds(fit, tile)}
      {#if bounds}
        <image
          href={tileUrl(config.url, tile)}
          x={bounds.left}
          y={bounds.top}
          width={bounds.width}
          height={bounds.height}
          preserveAspectRatio="none"
        />
      {/if}
    {/each}
  </g>
{/if}
