<script lang="ts">
	import { AreaX, AreaY } from 'svelteplot';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { AreaMarkerConfig } from '$lib/types/markers/common';

	/**
	 * Renders one `'area'` marker as `<AreaX>` or `<AreaY>`, picked from the way the plot
	 * runs (`usePlot().axes`). Never stacked by svelteplot itself: stacking is the
	 * `stackY`/`stackX` transform's job, which supplies the band it draws. Without
	 * a band, the area runs from zero up to its own value.
	 */
	let { marker }: { marker: AreaMarkerConfig } = $props();

	const plot = usePlot();
	const isHorizontal = $derived(plot.axes?.isHorizontal ?? false);
	const AreaMark = $derived(isHorizontal ? AreaX : AreaY);

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelFill = $derived(MarkerChannels.buildFill(data, marker.color, marker.scales, cfg));
	const opacityBuckets = $derived(
		MarkerChannels.buildOpacityBuckets(data, marker.opacity, marker.scales, cfg)
	);

	const hasYBand = $derived(marker.y1 !== undefined || marker.y2 !== undefined);
	const hasXBand = $derived(marker.x1 !== undefined || marker.x2 !== undefined);
	const y1 = $derived(hasYBand ? marker.y1 : 0);
	const y2 = $derived(hasYBand ? marker.y2 : (marker.y ?? 0));
	const x1 = $derived(hasXBand ? marker.x1 : 0);
	const x2 = $derived(hasXBand ? marker.x2 : (marker.x ?? 0));
	/** The band's two ends: along `x` when the plot runs horizontally, else along `y`. */
	const band = $derived(isHorizontal ? { x1, x2 } : { y1, y2 });
</script>

{#snippet area(rows: typeof data, fillOpacity: number | undefined)}
	<AreaMark
		data={rows}
		x={marker.x}
		y={marker.y}
		{...band}
		z={marker.grouping}
		stack={false}
		curve={marker.curve}
		tension={marker.tension}
		fill={channelFill ?? marker.styles?.fill}
		{fillOpacity}
		stroke={marker.styles?.stroke}
		strokeWidth={marker.styles?.strokeWidth}
		strokeOpacity={marker.styles?.strokeOpacity}
		strokeDasharray={marker.styles?.strokeDasharray}
	/>
{/snippet}

{#if opacityBuckets}
	{#each opacityBuckets as bucket (bucket.value)}
		{@render area(bucket.data, bucket.value)}
	{/each}
{:else}
	{@render area(data, marker.styles?.fillOpacity ?? cfg.area.fillOpacity)}
{/if}
