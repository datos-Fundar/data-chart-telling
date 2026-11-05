<script lang="ts">
	import MarkerLabel from '$lib/markers/utils/MarkerLabel.svelte';
	import { RowStyle } from '$lib/markers/utils/RowStyle';
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
</script>

<Cell
	{...events.props}
	{data}
	x={marker.x}
	y={marker.y}
	fill={channelFill ?? RowStyle.of(marker.styles?.fill, data)}
	fillOpacity={RowStyle.opacity(marker.styles?.fillOpacity) ?? 1}
	stroke={RowStyle.of(marker.styles?.stroke, data)}
	strokeWidth={RowStyle.field(marker.styles?.strokeWidth) ?? 0}
	strokeOpacity={RowStyle.opacity(marker.styles?.strokeOpacity)}
	strokeDasharray={marker.styles?.strokeDasharray}
	borderRadius={RowStyle.field(marker.styles?.borderRadius)}
	inset={RowStyle.field(marker.styles?.inset) ?? 0.5}
/>

<MarkerLabel {marker} />
