<script lang="ts">
  import { Line } from 'svelteplot';
  import type { LineMarkerConfig } from '$lib/types/markers/common';

  /** Renders one `'line'` marker as a `<Line>` call — just the stroke. Endpoint dots are a separate `'dot'` marker. */
  let { marker }: { marker: LineMarkerConfig } = $props();
</script>

<Line
  data={marker.data}
  x={marker.x}
  y={marker.y}
  stroke={marker.style?.stroke}
  strokeWidth={marker.style?.strokeWidth}
  strokeOpacity={marker.style?.strokeOpacity}
  strokeDasharray={marker.style?.strokeDasharray}
  strokeLinejoin={marker.style?.strokeLinejoin}
  strokeLinecap={marker.style?.strokeLinecap}
/>
