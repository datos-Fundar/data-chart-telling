<script lang="ts">
	import { MarkerEvents } from '$lib/markers/utils/MarkerEvents';
	import { Paint } from '$lib/markers/utils/Paint';
	import GradientDefs from '$lib/markers/utils/GradientDefs.svelte';
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
	const id = $props.id();
	const fill = $derived(
		Paint.of(data, marker.styles?.fill, Paint.under(marker.styles?.fill, channelFill), `${id}-fill`)
	);
	const stroke = $derived(
		Paint.of(
			data,
			marker.styles?.stroke,
			Paint.under(marker.styles?.stroke, channelFill),
			`${id}-stroke`
		)
	);
</script>

<GradientDefs paints={[fill, stroke]} />
<Hull
	{...events.props}
	{data}
	x={marker.x}
	y={marker.y}
	z={marker.grouping}
	fill={fill.prop ?? 'none'}
	fillOpacity={marker.styles?.fillOpacity}
	stroke={stroke.prop}
	strokeWidth={marker.styles?.strokeWidth}
	strokeOpacity={marker.styles?.strokeOpacity}
/>
