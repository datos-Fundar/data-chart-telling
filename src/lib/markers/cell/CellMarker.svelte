<script lang="ts">
	import { RowStyle } from '$lib/markers/utils/RowStyle';
	import { Paint } from '$lib/markers/utils/Paint';
	import GradientDefs from '$lib/markers/utils/GradientDefs.svelte';
	import { MarkerEvents } from '$lib/markers/utils/MarkerEvents';
	import { Cell } from 'svelteplot';
	import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { CellMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'cell'` marker as a `<Cell>` call. */
	let { marker }: { marker: CellMarkerConfig } = $props();
	const events = MarkerEvents.use(() => marker);

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelFill = $derived(MarkerChannels.buildFill(data, marker.color, marker.scales, cfg));
	const id = $props.id();
	const fill = $derived(Paint.of(data, marker.styles?.fill, channelFill, `${id}-fill`));
	const stroke = $derived(Paint.of(data, marker.styles?.stroke, undefined, `${id}-stroke`));
</script>

<GradientDefs paints={[fill, stroke]} />
<Cell
	{...events.props}
	{data}
	x={marker.x}
	y={marker.y}
	fill={fill.prop}
	fillOpacity={RowStyle.opacity(marker.styles?.fillOpacity) ?? 1}
	stroke={stroke.prop}
	strokeWidth={RowStyle.field(marker.styles?.strokeWidth) ?? 0}
	strokeOpacity={RowStyle.opacity(marker.styles?.strokeOpacity)}
	strokeDasharray={marker.styles?.strokeDasharray}
	borderRadius={RowStyle.field(marker.styles?.borderRadius)}
	inset={RowStyle.field(marker.styles?.inset) ?? 0.5}
/>
