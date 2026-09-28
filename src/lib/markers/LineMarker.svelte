<script lang="ts">
	import { Line } from 'svelteplot';
	import type { LineMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'line'` marker as a `<Line>` call — just the stroke. Endpoint dots are a separate `'dot'` marker. */
	let { marker }: { marker: LineMarkerConfig } = $props();

	const data = $derived(marker.data ?? []);
</script>

<Line
	{data}
	x={marker.x}
	y={marker.y}
	stroke={marker.styles?.stroke}
	strokeWidth={marker.styles?.strokeWidth}
	strokeOpacity={marker.styles?.strokeOpacity}
	strokeDasharray={marker.styles?.strokeDasharray}
	strokeLinejoin={marker.styles?.strokeLinejoin}
	strokeLinecap={marker.styles?.strokeLinecap}
/>
