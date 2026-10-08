<script lang="ts">
  import { Frame } from 'svelteplot';
  import TileLayer from '$lib/layout/styles/TileLayer.svelte';
  import { geometryLonLatBounds } from '$lib/plots/utils/geoAccessors';
  import type { StylesLayoutConfig } from '$lib/types/layout/styles';

  /**
   * Non-data cosmetic embellishments driven by a plot kind's own `styles`
   * prop. Composed by `BasePlotLayout` for every plot kind, nested inside
   * `CoordinatesLayout` so embellishments pan/zoom together with whatever
   * they're placed alongside: the raster basemap `tileLayer` (`GeoPlot`
   * only - other kinds' `styles` simply don't declare it) and the `frame`
   * border, available on every plot kind.
   */
  let {
    styles,
    width,
    height,
    numericMargins,
  }: {
    styles?: StylesLayoutConfig;
    width: number;
    height: number;
    numericMargins: { top: number; right: number; bottom: number; left: number };
  } = $props();

  const frame = $derived(styles?.frame);
  const frameStyle = $derived(typeof frame === 'object' ? frame : undefined);

  /** Auto-fits `TileLayer` to the tile-layer feature set `GeoPlot` tacks onto `styles.tileLayer.features` - see `StylesLayoutConfig`'s own doc comment. */
  const dataLonLatBounds = $derived.by((): [number, number, number, number] | null => {
    const features = styles?.tileLayer?.features;
    if (!features?.length) return null;
    let minLon = Infinity;
    let maxLon = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;
    for (const f of features) {
      const b = geometryLonLatBounds(f.geometry);
      if (!b) continue;
      if (b[0] < minLon) minLon = b[0];
      if (b[2] > maxLon) maxLon = b[2];
      if (b[1] < minLat) minLat = b[1];
      if (b[3] > maxLat) maxLat = b[3];
    }
    return minLon === Infinity ? null : [minLon, minLat, maxLon, maxLat];
  });
</script>

{#if styles?.tileLayer}
  <TileLayer
    config={styles.tileLayer}
    left={numericMargins.left}
    top={numericMargins.top}
    width={Math.max(0, width - numericMargins.left - numericMargins.right)}
    height={Math.max(0, height - numericMargins.top - numericMargins.bottom)}
    {dataLonLatBounds}
  />
{/if}
{#if frame}
  <Frame
    fill={frameStyle?.fill}
    fillOpacity={frameStyle?.fillOpacity}
    stroke={frameStyle?.stroke}
    strokeWidth={frameStyle?.strokeWidth}
    strokeOpacity={frameStyle?.strokeOpacity}
    strokeDasharray={frameStyle?.strokeDasharray}
    borderRadius={frameStyle?.borderRadius}
    inset={frameStyle?.inset}
    insetTop={frameStyle?.insetTop}
    insetRight={frameStyle?.insetRight}
    insetBottom={frameStyle?.insetBottom}
    insetLeft={frameStyle?.insetLeft}
  />
{/if}
