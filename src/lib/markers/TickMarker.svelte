<script lang="ts">
	import { isHorizontalFor } from '$lib/markers/orientation';
	import { TickX, TickY, usePlot } from 'svelteplot';
	import { resolveChannelFill } from '$lib/markers/resolveChannelFill';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { TickMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'tick'` marker as `<TickX>` or `<TickY>`, picked from the plot's axis scale types (see `isHorizontalFor`). */
	let { marker }: { marker: TickMarkerConfig } = $props();

	const plot = usePlot();
	const isHorizontal = $derived(isHorizontalFor(plot.scales.x?.type, plot.scales.y?.type));

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelStroke = $derived(resolveChannelFill(data, marker.color, marker.scales, cfg));
	const stroke = $derived(channelStroke ?? marker.styles?.stroke ?? 'currentColor');
</script>

{#if isHorizontal}
	<TickX
		{data}
		x={marker.x}
		y={marker.y}
		tickLength={marker.tickLength}
		{stroke}
		strokeWidth={marker.styles?.strokeWidth}
		strokeOpacity={marker.styles?.strokeOpacity}
		strokeDasharray={marker.styles?.strokeDasharray}
		strokeLinecap={marker.styles?.strokeLinecap}
	/>
{:else}
	<TickY
		{data}
		x={marker.x}
		y={marker.y}
		tickLength={marker.tickLength}
		{stroke}
		strokeWidth={marker.styles?.strokeWidth}
		strokeOpacity={marker.styles?.strokeOpacity}
		strokeDasharray={marker.styles?.strokeDasharray}
		strokeLinecap={marker.styles?.strokeLinecap}
	/>
{/if}
