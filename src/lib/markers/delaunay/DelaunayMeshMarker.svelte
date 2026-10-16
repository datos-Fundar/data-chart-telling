<script lang="ts">
	import { DelaunayMesh } from 'svelteplot';
	import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { DelaunayMeshMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'delaunayMesh'` marker as `<DelaunayMesh>` - the Delaunay triangulation as a single mesh. */
	let { marker }: { marker: DelaunayMeshMarkerConfig } = $props();

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelColor = $derived(MarkerChannels.buildFill(data, marker.color, marker.scales, cfg));
</script>

<DelaunayMesh
	{data}
	x={marker.x}
	y={marker.y}
	z={marker.grouping}
	fill={marker.styles?.fill}
	fillOpacity={marker.styles?.fillOpacity}
	stroke={marker.styles?.stroke ?? channelColor}
	strokeWidth={marker.styles?.strokeWidth}
	strokeOpacity={marker.styles?.strokeOpacity}
	strokeDasharray={marker.styles?.strokeDasharray}
/>
