<script lang="ts">
	import { MarkerEvents } from '$lib/markers/utils/MarkerEvents';
	import { Paint } from '$lib/markers/utils/Paint';
	import GradientDefs from '$lib/markers/utils/GradientDefs.svelte';
	import { Trail } from 'svelteplot';
	import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { TrailMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'trail'` marker as `<Trail>` - a ribbon whose width follows `r`. */
	let { marker }: { marker: TrailMarkerConfig } = $props();
	const events = MarkerEvents.use(() => marker);

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelFill = $derived(MarkerChannels.buildFill(data, marker.color, marker.scales, cfg));
	const id = $props.id();
	const fill = $derived(Paint.of(data, marker.styles?.fill, channelFill, `${id}-fill`));
</script>

<GradientDefs paints={[fill]} />
<Trail
	{...events.props}
	{data}
	x={marker.x}
	y={marker.y}
	r={marker.r}
	z={marker.grouping}
	curve={marker.curve}
	tension={marker.tension}
	cap={marker.cap}
	resolution={marker.resolution}
	fill={fill.prop ?? cfg.palette[0]}
	fillOpacity={marker.styles?.fillOpacity}
/>
