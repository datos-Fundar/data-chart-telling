<script lang="ts">
	import { Voronoi } from 'svelteplot';
	import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { VoronoiMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'voronoi'` marker as `<Voronoi>` - one Voronoi cell per point. */
	let { marker }: { marker: VoronoiMarkerConfig } = $props();

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelColor = $derived(MarkerChannels.buildFill(data, marker.color, marker.scales, cfg));
</script>

<Voronoi
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
