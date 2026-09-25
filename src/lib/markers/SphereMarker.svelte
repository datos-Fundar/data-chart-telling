<script lang="ts">
  import { Sphere } from 'svelteplot';
  import type { GeoSphereMarkerConfig } from '$lib/types/markers/geo';

  /** Renders one `'sphere'` marker — the outer globe outline. */
  let { marker }: { marker: GeoSphereMarkerConfig } = $props();
</script>

<Sphere
  fill={marker.styles?.fill}
  fillOpacity={marker.styles?.fillOpacity}
  stroke={marker.styles?.stroke ?? 'currentColor'}
  strokeWidth={marker.styles?.strokeWidth ?? 1}
  style="vector-effect: non-scaling-stroke"
/>
