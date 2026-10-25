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
	const TickMark = $derived(isHorizontal ? TickX : TickY);

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelStroke = $derived(MarkerChannels.buildFill(data, marker.color, marker.scales, cfg));
	const stroke = $derived(channelStroke ?? marker.styles?.stroke ?? 'currentColor');

	/**
	 * A tick across a band axis spans the whole band, whatever `tickLength` says -
	 * svelteplot reads it only off a band-less axis. A fixed `tickLength` there is
	 * made true by insetting the tick from both edges of its band.
	 */
	const inset = $derived.by(() => {
		const length = marker.tickLength;
		const across = plot.svelteplot.scales[isHorizontal ? 'y' : 'x'];
		if (typeof length !== 'number' || across.type !== 'band') return undefined;
		return Math.max(0, (across.fn.bandwidth() - length) / 2);
	});
	/** svelteplot's tick marks read `inset` though their types do not list it. */
	const insetProps = $derived((inset === undefined ? {} : { inset }) as Record<string, unknown>);
</script>

<TickMark
	{data}
	x={marker.x}
	y={marker.y}
	tickLength={marker.tickLength}
	{...insetProps}
	{stroke}
	strokeWidth={marker.styles?.strokeWidth}
	strokeOpacity={marker.styles?.strokeOpacity}
	strokeDasharray={marker.styles?.strokeDasharray}
	strokeLinecap={marker.styles?.strokeLinecap}
/>
