<script lang="ts">
	import { MarkerEvents } from '$lib/markers/utils/MarkerEvents';
	import { Hull } from 'svelteplot';
	import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { HullMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'hull'` marker as `<Hull>` - the convex hull around a cluster of points. */
	let { marker }: { marker: HullMarkerConfig } = $props();
	const events = MarkerEvents.use(() => marker);

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelFill = $derived(MarkerChannels.buildFill(data, marker.color, marker.scales, cfg));
</script>

<Hull
	{...events.props}
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
