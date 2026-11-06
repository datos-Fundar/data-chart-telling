<script lang="ts">
	import { RowStyle } from '$lib/markers/utils/RowStyle';
	import { MarkerEvents } from '$lib/markers/utils/MarkerEvents';
	import { Voronoi } from 'svelteplot';
	import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { VoronoiMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'voronoi'` marker as `<Voronoi>` - one Voronoi cell per point. */
	let { marker }: { marker: VoronoiMarkerConfig } = $props();
	const events = MarkerEvents.use(() => marker);

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelColor = $derived(MarkerChannels.buildFill(data, marker.color, marker.scales, cfg));
</script>

<Voronoi
	{...events.props}
	{data}
	x={marker.x}
	y={marker.y}
	z={marker.grouping}
	fill={RowStyle.of(marker.styles?.fill, data)}
	fillOpacity={RowStyle.opacity(marker.styles?.fillOpacity)}
	stroke={RowStyle.of(marker.styles?.stroke, data) ?? channelColor}
	strokeWidth={RowStyle.field(marker.styles?.strokeWidth)}
	strokeOpacity={RowStyle.opacity(marker.styles?.strokeOpacity)}
	strokeDasharray={marker.styles?.strokeDasharray}
/>
