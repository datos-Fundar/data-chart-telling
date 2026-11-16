<script lang="ts">
	import { MarkerEvents } from '$lib/markers/utils/MarkerEvents';
	import { Paint } from '$lib/markers/utils/Paint';
	import GradientDefs from '$lib/markers/utils/GradientDefs.svelte';
	import { Gradient } from '$lib/markers/utils/Gradient';
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
	const events = MarkerEvents.use(() => marker);

	const plot = usePlot();
	const isHorizontal = $derived(marker.isHorizontal ?? plot.axes?.isHorizontal ?? false);
	const AreaMark = $derived(isHorizontal ? AreaX : AreaY);

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelFill = $derived(MarkerChannels.buildFill(data, marker.color, marker.scales, cfg));
	const id = $props.id();
	const fill = $derived(Paint.of(data, marker.styles?.fill, channelFill, `${id}-fill`));
	const stroke = $derived(Paint.of(data, marker.styles?.stroke, channelFill, `${id}-stroke`));
	/** A gradient fill carries its own opacity: the configuration's default does not dim it further. */
	const defaultFillOpacity = $derived(
		fill.defs.length
			? undefined
			: Gradient.defaultOpacity(marker.styles?.fill, cfg.area.fillOpacity)
	);
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
		{...events.props}
		data={rows}
		x={marker.x}
		y={marker.y}
		{...band}
		z={marker.grouping}
		stack={false}
		curve={marker.curve}
		tension={marker.tension}
		fill={fill.prop}
		{fillOpacity}
		stroke={marker.styles?.stroke === undefined ? undefined : stroke.prop}
		strokeWidth={marker.styles?.strokeWidth}
		strokeOpacity={marker.styles?.strokeOpacity}
		strokeDasharray={marker.styles?.strokeDasharray}
	/>
{/snippet}

<GradientDefs paints={[fill, stroke]} />
{#if opacityBuckets}
	{#each opacityBuckets as bucket (bucket.value)}
		{@render area(bucket.data, bucket.value)}
	{/each}
{:else}
	{@render area(data, marker.styles?.fillOpacity ?? defaultFillOpacity)}
{/if}
