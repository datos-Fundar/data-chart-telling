<script lang="ts">
  import { Cell } from 'svelteplot';
  import { resolveChannelFill } from '$lib/markers/resolveChannelFill';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import type { CellMarkerConfig } from '$lib/types/markers/common';

  /** Renders one `'cell'` marker as a `<Cell>` call. */
  let { marker }: { marker: CellMarkerConfig } = $props();

  const cfg = $derived(getConfiguration());
  const channelFill = $derived(resolveChannelFill(marker.data, marker.color, marker.scales, cfg));
</script>

<Cell
  data={marker.data}
  x={marker.x}
  y={marker.y}
  fill={channelFill ?? marker.fill}
  fillOpacity={marker.styles?.fillOpacity ?? 1}
  stroke={marker.styles?.stroke}
  strokeWidth={marker.styles?.strokeWidth ?? 0}
  strokeOpacity={marker.styles?.strokeOpacity}
  strokeDasharray={marker.styles?.strokeDasharray}
  borderRadius={marker.styles?.borderRadius}
  inset={marker.inset ?? 0.5}
/>
