<script lang="ts">
	import { isHorizontalFor } from '$lib/markers/orientation';
	import { AreaX, AreaY, usePlot } from 'svelteplot';
	import {
		resolveChannelFill,
		resolveChannelOpacityBuckets
	} from '$lib/markers/resolveChannelFill';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { AreaMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'area'` marker as `<AreaX>` or `<AreaY>`, picked from the plot's axis scale types (see `isHorizontalFor`). */
	let { marker }: { marker: AreaMarkerConfig } = $props();

	const plot = usePlot();
	const isHorizontal = $derived(isHorizontalFor(plot.scales.x?.type, plot.scales.y?.type));

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelFill = $derived(resolveChannelFill(data, marker.color, marker.scales, cfg));
	const opacityBuckets = $derived(
		resolveChannelOpacityBuckets(data, marker.opacity, marker.scales, cfg)
	);
</script>

{#if opacityBuckets}
	{#each opacityBuckets as bucket (bucket.value)}
		{#if isHorizontal}
			<AreaX
				data={bucket.data}
				x={marker.x}
				x1={marker.x1}
				x2={marker.x2}
				y={marker.y}
				z={marker.grouping}
				curve={marker.curve}
				tension={marker.tension}
				fill={channelFill ?? marker.styles?.fill}
				fillOpacity={bucket.value}
				stroke={marker.styles?.stroke}
				strokeWidth={marker.styles?.strokeWidth}
				strokeOpacity={marker.styles?.strokeOpacity}
				strokeDasharray={marker.styles?.strokeDasharray}
			/>
		{:else}
			<AreaY
				data={bucket.data}
				x={marker.x}
				y={marker.y}
				y1={marker.y1}
				y2={marker.y2}
				z={marker.grouping}
				curve={marker.curve}
				tension={marker.tension}
				fill={channelFill ?? marker.styles?.fill}
				fillOpacity={bucket.value}
				stroke={marker.styles?.stroke}
				strokeWidth={marker.styles?.strokeWidth}
				strokeOpacity={marker.styles?.strokeOpacity}
				strokeDasharray={marker.styles?.strokeDasharray}
			/>
		{/if}
	{/each}
{:else if isHorizontal}
	<AreaX
		{data}
		x={marker.x}
		x1={marker.x1}
		x2={marker.x2}
		y={marker.y}
		z={marker.grouping}
		curve={marker.curve}
		tension={marker.tension}
		fill={channelFill ?? marker.styles?.fill}
		fillOpacity={marker.styles?.fillOpacity ?? 1}
		stroke={marker.styles?.stroke}
		strokeWidth={marker.styles?.strokeWidth}
		strokeOpacity={marker.styles?.strokeOpacity}
		strokeDasharray={marker.styles?.strokeDasharray}
	/>
{:else}
	<AreaY
		{data}
		x={marker.x}
		y={marker.y}
		y1={marker.y1}
		y2={marker.y2}
		z={marker.grouping}
		curve={marker.curve}
		tension={marker.tension}
		fill={channelFill ?? marker.styles?.fill}
		fillOpacity={marker.styles?.fillOpacity ?? 1}
		stroke={marker.styles?.stroke}
		strokeWidth={marker.styles?.strokeWidth}
		strokeOpacity={marker.styles?.strokeOpacity}
		strokeDasharray={marker.styles?.strokeDasharray}
	/>
{/if}
