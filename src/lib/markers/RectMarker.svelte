<script lang="ts">
	import { Rect } from 'svelteplot';
	import {
		resolveChannelFill,
		resolveChannelOpacityBuckets
	} from '$lib/markers/resolveChannelFill';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { RectMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'rect'` marker as a `<Rect>` call - an arbitrary rectangle, unlike `BarMarker`'s category-band-anchored bar. */
	let { marker }: { marker: RectMarkerConfig } = $props();

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelFill = $derived(resolveChannelFill(data, marker.color, marker.scales, cfg));
	const opacityBuckets = $derived(
		resolveChannelOpacityBuckets(data, marker.opacity, marker.scales, cfg)
	);
</script>

{#if opacityBuckets}
	{#each opacityBuckets as bucket (bucket.value)}
		<Rect
			data={bucket.data}
			x={marker.x}
			y={marker.y}
			x1={marker.x1}
			x2={marker.x2}
			y1={marker.y1}
			y2={marker.y2}
			interval={marker.interval}
			insetLeft={marker.insetLeft}
			insetRight={marker.insetRight}
			insetTop={marker.insetTop}
			insetBottom={marker.insetBottom}
			fill={channelFill ?? marker.styles?.fill}
			fillOpacity={bucket.value}
			stroke={marker.styles?.stroke}
			strokeWidth={marker.styles?.strokeWidth}
			strokeOpacity={marker.styles?.strokeOpacity}
			strokeDasharray={marker.styles?.strokeDasharray}
		/>
	{/each}
{:else}
	<Rect
		{data}
		x={marker.x}
		y={marker.y}
		x1={marker.x1}
		x2={marker.x2}
		y1={marker.y1}
		y2={marker.y2}
		interval={marker.interval}
		insetLeft={marker.insetLeft}
		insetRight={marker.insetRight}
		insetTop={marker.insetTop}
		insetBottom={marker.insetBottom}
		fill={channelFill ?? marker.styles?.fill}
		fillOpacity={marker.styles?.fillOpacity ?? 1}
		stroke={marker.styles?.stroke}
		strokeWidth={marker.styles?.strokeWidth}
		strokeOpacity={marker.styles?.strokeOpacity}
		strokeDasharray={marker.styles?.strokeDasharray}
	/>
{/if}
