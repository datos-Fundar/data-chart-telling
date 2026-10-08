<script lang="ts">
  import { Geo } from 'svelteplot';
  import type { GeoFeaturesMarkerConfig } from '$lib/types/markers/geo';

  /** Renders one `'geo'` marker - one resolved-style bucket of the base map's own features, as a single `<Geo>` call. */
  let { marker }: { marker: GeoFeaturesMarkerConfig } = $props();
</script>

<Geo
  data={marker.data}
  fill={marker.fill}
  fillOpacity={marker.fillOpacity ?? 1}
  stroke={marker.stroke ?? 'currentColor'}
  strokeWidth={marker.strokeWidth ?? 0.5}
  style="vector-effect: non-scaling-stroke"
  onclick={marker.onclick}
  onpointerenter={marker.onpointerenter}
  onpointerleave={marker.onpointerleave}
/>
