<script lang="ts">
  import { Vector } from 'svelteplot';
  import type { GeoVectorMarkerConfig } from '$lib/types/markers/geo';

  /** Renders one `'vector'` marker — arrows/spikes at points. */
  let { marker }: { marker: GeoVectorMarkerConfig } = $props();
</script>

<Vector
  data={marker.data}
  x={marker.x}
  y={marker.y}
  length={marker.length}
  rotate={marker.rotate}
  shape={marker.shape ?? 'arrow'}
  anchor={marker.anchor}
  fill={marker.styles?.fill ?? 'currentColor'}
  stroke={marker.styles?.stroke}
  strokeWidth={marker.styles?.strokeWidth}
/>
