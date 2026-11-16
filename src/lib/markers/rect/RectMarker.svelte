<script lang="ts">
	import { RowStyle } from '$lib/markers/utils/RowStyle';
	import { Paint } from '$lib/markers/utils/Paint';
	import GradientDefs from '$lib/markers/utils/GradientDefs.svelte';
	import { Rect } from 'svelteplot';
	import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { MarkerEvents } from '$lib/markers/utils/MarkerEvents';
	import type { RectMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'rect'` marker as a `<Rect>` call - an arbitrary rectangle, unlike `BarMarker`'s category-band-anchored bar. */
	let { marker }: { marker: RectMarkerConfig } = $props();

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelFill = $derived(MarkerChannels.buildFill(data, marker.color, marker.scales, cfg));
	const id = $props.id();
	const fill = $derived(Paint.of(data, marker.styles?.fill, channelFill, `${id}-fill`));
	const stroke = $derived(Paint.of(data, marker.styles?.stroke, undefined, `${id}-stroke`));
	const opacityBuckets = $derived(
		MarkerChannels.buildOpacityBuckets(data, marker.opacity, marker.scales, cfg)
	);

	const events = MarkerEvents.use(() => marker);
</script>

<GradientDefs paints={[fill, stroke]} />
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
			insetLeft={RowStyle.field(marker.styles?.insetLeft)}
			insetRight={RowStyle.field(marker.styles?.insetRight)}
			insetTop={RowStyle.field(marker.styles?.insetTop)}
			insetBottom={RowStyle.field(marker.styles?.insetBottom)}
			fill={fill.prop}
			fillOpacity={bucket.value}
			stroke={stroke.prop}
			strokeWidth={RowStyle.field(marker.styles?.strokeWidth)}
			strokeOpacity={RowStyle.opacity(marker.styles?.strokeOpacity)}
			strokeDasharray={marker.styles?.strokeDasharray}
			borderRadius={RowStyle.field(marker.styles?.borderRadius)}
			{...events.props}
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
		insetLeft={RowStyle.field(marker.styles?.insetLeft)}
		insetRight={RowStyle.field(marker.styles?.insetRight)}
		insetTop={RowStyle.field(marker.styles?.insetTop)}
		insetBottom={RowStyle.field(marker.styles?.insetBottom)}
		fill={fill.prop}
		fillOpacity={RowStyle.opacity(marker.styles?.fillOpacity) ?? 1}
		stroke={stroke.prop}
		strokeWidth={RowStyle.field(marker.styles?.strokeWidth)}
		strokeOpacity={RowStyle.opacity(marker.styles?.strokeOpacity)}
		strokeDasharray={marker.styles?.strokeDasharray}
		borderRadius={RowStyle.field(marker.styles?.borderRadius)}
		{...events.props}
	/>
{/if}
