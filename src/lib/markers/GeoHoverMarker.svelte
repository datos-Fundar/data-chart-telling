<script lang="ts">
  import { Geo } from 'svelteplot';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import type { GeoHoverMarkerConfig } from '$lib/types/markers/geo';
  import type { HoverPoint } from '$lib/types/layout/tooltip';

  /** Renders the hovered feature restyled in place — no dot, no label. `pointer-events: none` so it never steals hover from the base map underneath it. */
  let { marker, data }: { marker: GeoHoverMarkerConfig; data: HoverPoint<Record<string, unknown>>[] } = $props();

  const cfg = $derived(getConfiguration());
  const style = $derived({ ...cfg.hover.area, ...marker.style });
</script>

{#if data.length > 0}
  <Geo
    data={data.map((p) => p.row)}
    fill={style.fill}
    fillOpacity={style.fillOpacity}
    stroke={style.stroke}
    strokeWidth={style.strokeWidth}
    strokeOpacity={style.strokeOpacity}
    strokeDasharray={style.strokeDasharray}
    style="vector-effect: non-scaling-stroke; pointer-events: none;"
  />
{/if}
