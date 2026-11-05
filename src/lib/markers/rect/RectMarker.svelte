<script lang="ts">
	import { RowStyle } from '$lib/markers/utils/RowStyle';
	import { Rect } from 'svelteplot';
	import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { MarkerEvents } from '$lib/markers/utils/MarkerEvents';
	import { PlotContext } from '$lib/layout/plot/PlotContext';
	import type { RectMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'rect'` marker as a `<Rect>` call - an arbitrary rectangle, unlike `BarMarker`'s category-band-anchored bar. */
	let { marker }: { marker: RectMarkerConfig } = $props();

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelFill = $derived(MarkerChannels.buildFill(data, marker.color, marker.scales, cfg));
	const opacityBuckets = $derived(
		MarkerChannels.buildOpacityBuckets(data, marker.opacity, marker.scales, cfg)
	);

	const events = MarkerEvents.use(() => marker);
	const hover = PlotContext.current()?.hover;
	/** The marker's handlers, and with `hover` the plot's hover too: entering the rectangle hovers its rows. */
	const handlers = $derived.by(() => {
		const own = events.props;
		if (!marker.hover) return own;
		return {
			...own,
			onpointerenter: (event: Event, row: unknown, index: number) => {
				own.onpointerenter?.(event, row, index);
				hover?.onPointer((marker.data ?? []) as Record<string, unknown>[]);
			},
			onpointerleave: (event: Event, row: unknown, index: number) => {
				own.onpointerleave?.(event, row, index);
				hover?.onLeave();
			}
		};
	});
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
			insetLeft={RowStyle.field(marker.styles?.insetLeft)}
			insetRight={RowStyle.field(marker.styles?.insetRight)}
			insetTop={RowStyle.field(marker.styles?.insetTop)}
			insetBottom={RowStyle.field(marker.styles?.insetBottom)}
			fill={channelFill ?? RowStyle.of(marker.styles?.fill, data)}
			fillOpacity={bucket.value}
			stroke={RowStyle.of(marker.styles?.stroke, data)}
			strokeWidth={RowStyle.field(marker.styles?.strokeWidth)}
			strokeOpacity={RowStyle.opacity(marker.styles?.strokeOpacity)}
			strokeDasharray={marker.styles?.strokeDasharray}
			borderRadius={RowStyle.field(marker.styles?.borderRadius)}
			{...handlers}
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
		fill={channelFill ?? RowStyle.of(marker.styles?.fill, data)}
		fillOpacity={RowStyle.opacity(marker.styles?.fillOpacity) ?? 1}
		stroke={RowStyle.of(marker.styles?.stroke, data)}
		strokeWidth={RowStyle.field(marker.styles?.strokeWidth)}
		strokeOpacity={RowStyle.opacity(marker.styles?.strokeOpacity)}
		strokeDasharray={marker.styles?.strokeDasharray}
		borderRadius={RowStyle.field(marker.styles?.borderRadius)}
		{...handlers}
	/>
{/if}
