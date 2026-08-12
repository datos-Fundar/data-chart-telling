<script lang="ts">
  import { Graticule } from 'svelteplot';
  import type { GeoGraticuleMarkerConfig } from '$lib/types/markers/geo';

  /** Renders one `'graticule'` marker — longitude/latitude gridlines. */
  let { marker }: { marker: GeoGraticuleMarkerConfig } = $props();
</script>

<Graticule
  step={marker.step}
  stepX={marker.stepX}
  stepY={marker.stepY}
  stroke={marker.style?.stroke ?? 'currentColor'}
  strokeWidth={marker.style?.strokeWidth ?? 0.5}
  strokeOpacity={marker.style?.strokeOpacity ?? 0.3}
  strokeDasharray={marker.style?.strokeDasharray}
  style="vector-effect: non-scaling-stroke"
/>
