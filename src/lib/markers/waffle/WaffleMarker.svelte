<script lang="ts">
	import { RowStyle } from '$lib/markers/utils/RowStyle';
	import { Paint } from '$lib/markers/utils/Paint';
	import GradientDefs from '$lib/markers/utils/GradientDefs.svelte';
	import { MarkerEvents } from '$lib/markers/utils/MarkerEvents';
	import { WaffleX, WaffleY } from 'svelteplot';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { WaffleMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'waffle'` marker as `<WaffleX>` or `<WaffleY>`, picked from the way the plot runs (`usePlot().axes`). */
	let { marker }: { marker: WaffleMarkerConfig } = $props();
	const events = MarkerEvents.use(() => marker);

	const plot = usePlot();
	const isHorizontal = $derived(marker.isHorizontal ?? plot.axes?.isHorizontal ?? false);
	const WaffleMark = $derived(isHorizontal ? WaffleX : WaffleY);

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelFill = $derived(MarkerChannels.buildFill(data, marker.color, marker.scales, cfg));
	const id = $props.id();
	const fill = $derived(Paint.of(data, marker.styles?.fill, channelFill, `${id}-fill`));
	const stroke = $derived(Paint.of(data, marker.styles?.stroke, undefined, `${id}-stroke`));
</script>

<GradientDefs paints={[fill, stroke]} />
<WaffleMark
	{...events.props}
	{data}
	x={marker.x}
	y={marker.y}
	{...isHorizontal ? { x1: marker.x1, x2: marker.x2 } : { y1: marker.y1, y2: marker.y2 }}
	unit={marker.unit}
	multiple={marker.multiple}
	gap={marker.gap}
	round={marker.round}
	borderRadius={RowStyle.field(marker.styles?.borderRadius)}
	fill={fill.prop ?? cfg.palette[0]}
	fillOpacity={RowStyle.opacity(marker.styles?.fillOpacity)}
	stroke={stroke.prop}
	strokeWidth={RowStyle.field(marker.styles?.strokeWidth)}
	strokeOpacity={RowStyle.opacity(marker.styles?.strokeOpacity)}
/>
