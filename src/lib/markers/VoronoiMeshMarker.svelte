<script lang="ts">
	import { VoronoiMesh } from 'svelteplot';
	import { resolveChannelFill } from '$lib/markers/resolveChannelFill';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { VoronoiMeshMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'voronoiMesh'` marker as `<VoronoiMesh>` - the Voronoi diagram as a single mesh. */
	let { marker }: { marker: VoronoiMeshMarkerConfig } = $props();

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelColor = $derived(resolveChannelFill(data, marker.color, marker.scales, cfg));
</script>

<VoronoiMesh
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
