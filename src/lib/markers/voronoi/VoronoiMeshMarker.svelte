<script lang="ts">
	import { MarkerEvents } from '$lib/markers/utils/MarkerEvents';
	import { Paint } from '$lib/markers/utils/Paint';
	import GradientDefs from '$lib/markers/utils/GradientDefs.svelte';
	import { VoronoiMesh } from 'svelteplot';
	import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { VoronoiMeshMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'voronoiMesh'` marker as `<VoronoiMesh>` - the Voronoi diagram as a single mesh. */
	let { marker }: { marker: VoronoiMeshMarkerConfig } = $props();
	const events = MarkerEvents.use(() => marker);

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelColor = $derived(MarkerChannels.buildFill(data, marker.color, marker.scales, cfg));
	const id = $props.id();
	const fill = $derived(Paint.single(marker.styles?.fill, undefined, `${id}-fill`));
	const stroke = $derived(Paint.single(marker.styles?.stroke, undefined, `${id}-stroke`));
</script>

<GradientDefs paints={[fill, stroke]} />
<VoronoiMesh
	{...events.props}
	{data}
	x={marker.x}
	y={marker.y}
	z={marker.grouping}
	fill={fill.value}
	fillOpacity={marker.styles?.fillOpacity}
	stroke={stroke.value ?? channelColor}
	strokeWidth={marker.styles?.strokeWidth}
	strokeOpacity={marker.styles?.strokeOpacity}
	strokeDasharray={marker.styles?.strokeDasharray}
/>
