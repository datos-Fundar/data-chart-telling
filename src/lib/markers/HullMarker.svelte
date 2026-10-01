<script lang="ts">
	import { Hull } from 'svelteplot';
	import { resolveChannelFill } from '$lib/markers/resolveChannelFill';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { HullMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'hull'` marker as `<Hull>` — the convex hull around a cluster of points. */
	let { marker }: { marker: HullMarkerConfig } = $props();

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelFill = $derived(resolveChannelFill(data, marker.color, marker.scales, cfg));
</script>

<Hull
	{data}
	x={marker.x}
	y={marker.y}
	z={marker.grouping}
	fill={marker.styles?.fill ?? channelFill ?? 'none'}
	fillOpacity={marker.styles?.fillOpacity}
	stroke={marker.styles?.stroke ?? channelFill}
	strokeWidth={marker.styles?.strokeWidth}
	strokeOpacity={marker.styles?.strokeOpacity}
/>
