<script lang="ts">
	import { WaffleX, WaffleY } from 'svelteplot';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { WaffleMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'waffle'` marker as `<WaffleX>` or `<WaffleY>`, picked from the way the plot runs (`usePlot().axes`). */
	let { marker }: { marker: WaffleMarkerConfig } = $props();

	const plot = usePlot();
	const isHorizontal = $derived(plot.axes?.isHorizontal ?? false);
	const WaffleMark = $derived(isHorizontal ? WaffleX : WaffleY);

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelFill = $derived(MarkerChannels.buildFill(data, marker.color, marker.scales, cfg));
	const fill = $derived(channelFill ?? marker.styles?.fill ?? cfg.palette[0]);
</script>

<WaffleMark
	{data}
	x={marker.x}
	y={marker.y}
	{...isHorizontal ? { x1: marker.x1, x2: marker.x2 } : { y1: marker.y1, y2: marker.y2 }}
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
