<script lang="ts">
	import { isHorizontalFor } from '$lib/markers/orientation';
	import { WaffleX, WaffleY, usePlot } from 'svelteplot';
	import { resolveChannelFill } from '$lib/markers/resolveChannelFill';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { WaffleMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'waffle'` marker as `<WaffleX>` or `<WaffleY>`, picked from the plot's axis scale types (see `isHorizontalFor`). */
	let { marker }: { marker: WaffleMarkerConfig } = $props();

	const plot = usePlot();
	const isHorizontal = $derived(isHorizontalFor(plot.scales.x?.type, plot.scales.y?.type));

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelFill = $derived(resolveChannelFill(data, marker.color, marker.scales, cfg));
	const fill = $derived(channelFill ?? marker.styles?.fill ?? cfg.palette[0]);
</script>

{#if isHorizontal}
	<WaffleX
		{data}
		x={marker.x}
		x1={marker.x1}
		x2={marker.x2}
		y={marker.y}
		unit={marker.unit}
		multiple={marker.multiple}
		gap={marker.gap}
		round={marker.round}
		borderRadius={marker.styles?.borderRadius}
		{fill}
		fillOpacity={marker.styles?.fillOpacity}
		stroke={marker.styles?.stroke}
		strokeWidth={marker.styles?.strokeWidth}
		strokeOpacity={marker.styles?.strokeOpacity}
	/>
{:else}
	<WaffleY
		{data}
		x={marker.x}
		y={marker.y}
		y1={marker.y1}
		y2={marker.y2}
		unit={marker.unit}
		multiple={marker.multiple}
		gap={marker.gap}
		round={marker.round}
		borderRadius={marker.styles?.borderRadius}
		{fill}
		fillOpacity={marker.styles?.fillOpacity}
		stroke={marker.styles?.stroke}
		strokeWidth={marker.styles?.strokeWidth}
		strokeOpacity={marker.styles?.strokeOpacity}
	/>
{/if}
