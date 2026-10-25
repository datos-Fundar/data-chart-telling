<script lang="ts">
	import { Line } from 'svelteplot';
	import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { LineMarkerConfig } from '$lib/types/markers/common';

	/**
	 * Renders one `'line'` marker as a `<Line>` call - just the stroke. Endpoint
	 * dots are a separate `'dot'` marker. A `color` channel strokes each row by
	 * its color, so each `grouping`'s line takes its group's color.
	 */
	let { marker }: { marker: LineMarkerConfig } = $props();

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelStroke = $derived(MarkerChannels.buildFill(data, marker.color, marker.scales, cfg));
</script>

<Line
	{data}
	x={marker.x}
	y={marker.y}
	z={marker.grouping}
	curve={marker.curve ?? cfg.line.curve}
	stroke={channelStroke ?? marker.styles?.stroke}
	strokeWidth={marker.styles?.strokeWidth}
	strokeOpacity={marker.styles?.strokeOpacity}
	strokeDasharray={marker.styles?.strokeDasharray}
	strokeLinejoin={marker.styles?.strokeLinejoin}
	strokeLinecap={marker.styles?.strokeLinecap}
/>
