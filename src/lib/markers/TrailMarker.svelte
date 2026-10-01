<script lang="ts">
	import { Trail } from 'svelteplot';
	import { resolveChannelFill } from '$lib/markers/resolveChannelFill';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { TrailMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'trail'` marker as `<Trail>` — a ribbon whose width follows `r`. */
	let { marker }: { marker: TrailMarkerConfig } = $props();

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelFill = $derived(resolveChannelFill(data, marker.color, marker.scales, cfg));
</script>

<Trail
	{data}
	x={marker.x}
	y={marker.y}
	r={marker.r}
	z={marker.grouping}
	curve={marker.curve}
	tension={marker.tension}
	cap={marker.cap}
	resolution={marker.resolution}
	fill={channelFill ?? marker.styles?.fill ?? cfg.palette[0]}
	fillOpacity={marker.styles?.fillOpacity}
/>
