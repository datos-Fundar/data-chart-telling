<script lang="ts">
	import { DelaunayLink } from 'svelteplot';
	import { resolveChannelFill } from '$lib/markers/resolveChannelFill';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { DelaunayLinkMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'delaunayLink'` marker as `<DelaunayLink>` — one line per Delaunay triangulation edge. */
	let { marker }: { marker: DelaunayLinkMarkerConfig } = $props();

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelColor = $derived(resolveChannelFill(data, marker.color, marker.scales, cfg));
</script>

<DelaunayLink
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
