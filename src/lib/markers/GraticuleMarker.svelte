<script lang="ts">
  import { Graticule } from 'svelteplot';
  import type { GeoGraticuleMarkerConfig } from '$lib/types/markers/geo';

  /** Renders one `'graticule'` marker - longitude/latitude gridlines. */
  let { marker }: { marker: GeoGraticuleMarkerConfig } = $props();
</script>

<Graticule
  step={marker.step}
  stepX={marker.stepX}
  stepY={marker.stepY}
  stroke={marker.styles?.stroke ?? 'currentColor'}
  strokeWidth={marker.styles?.strokeWidth ?? 0.5}
  strokeOpacity={marker.styles?.strokeOpacity ?? 0.3}
  strokeDasharray={marker.styles?.strokeDasharray}
  style="vector-effect: non-scaling-stroke"
/>
