<script lang="ts">
	import { TickX, TickY } from 'svelteplot';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { TickMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'tick'` marker as `<TickX>` or `<TickY>`, picked from the way the plot runs (`usePlot().axes`). */
	let { marker }: { marker: TickMarkerConfig } = $props();

	const plot = usePlot();
	const isHorizontal = $derived(plot.axes?.isHorizontal ?? false);

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelStroke = $derived(MarkerChannels.buildFill(data, marker.color, marker.scales, cfg));
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
