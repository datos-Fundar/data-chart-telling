<script lang="ts">
  import { Sphere } from 'svelteplot';
  import type { GeoSphereMarkerConfig } from '$lib/types/markers/geo';

  /** Renders one `'sphere'` marker — the outer globe outline. */
  let { marker }: { marker: GeoSphereMarkerConfig } = $props();
</script>

<Sphere
  fill={marker.style?.fill}
  fillOpacity={marker.style?.fillOpacity}
  stroke={marker.style?.stroke ?? 'currentColor'}
  strokeWidth={marker.style?.strokeWidth ?? 1}
  style="vector-effect: non-scaling-stroke"
/>
