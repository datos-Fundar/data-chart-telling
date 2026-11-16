<script lang="ts">
	import { RowStyle } from '$lib/markers/utils/RowStyle';
	import { MarkerEvents } from '$lib/markers/utils/MarkerEvents';
	import { Paint } from '$lib/markers/utils/Paint';
	import GradientDefs from '$lib/markers/utils/GradientDefs.svelte';
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
	const id = $props.id();
	const fill = $derived(Paint.of(data, marker.styles?.fill, undefined, `${id}-fill`));
	const stroke = $derived(
		Paint.of(
			data,
			marker.styles?.stroke,
			Paint.under(marker.styles?.stroke, channelColor),
			`${id}-stroke`
		)
	);
</script>

<GradientDefs paints={[fill, stroke]} />
<Voronoi
	{...events.props}
	{data}
	x={marker.x}
	y={marker.y}
	z={marker.grouping}
	fill={fill.prop}
	fillOpacity={RowStyle.opacity(marker.styles?.fillOpacity)}
	stroke={stroke.prop}
	strokeWidth={RowStyle.field(marker.styles?.strokeWidth)}
	strokeOpacity={RowStyle.opacity(marker.styles?.strokeOpacity)}
	strokeDasharray={marker.styles?.strokeDasharray}
/>
