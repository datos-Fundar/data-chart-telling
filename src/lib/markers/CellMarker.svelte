<script lang="ts">
  import { Cell } from 'svelteplot';
  import type { CellMarkerConfig } from '$lib/types/markers/common';

  /** Renders one `'cell'` marker as a `<Cell>` call. */
  let { marker }: { marker: CellMarkerConfig } = $props();
</script>

<Cell
  data={marker.data}
  x={marker.x}
  y={marker.y}
  fill={marker.fill}
  fillOpacity={marker.style?.fillOpacity ?? 1}
  stroke={marker.style?.stroke}
  strokeWidth={marker.style?.strokeWidth ?? 0}
  strokeOpacity={marker.style?.strokeOpacity}
  strokeDasharray={marker.style?.strokeDasharray}
  borderRadius={marker.style?.borderRadius}
  inset={marker.inset ?? 0.5}
/>
