<script lang="ts">
	import { Image } from 'svelteplot';
	import RowOffsetMarks from '$lib/markers/utils/RowOffsetMarks.svelte';
	import type { ImageMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'image'` marker as `<Image>` - an image centered on each row's `x`/`y`. */
	let { marker }: { marker: ImageMarkerConfig } = $props();

	const data = $derived(marker.data ?? []);
</script>

<RowOffsetMarks {marker} rows={data}>
	{#snippet mark(rows)}
		<Image
			data={rows}
			x={marker.x}
			y={marker.y}
			src={marker.src}
			r={marker.r}
			width={marker.width}
			height={marker.height}
			title={marker.title}
			preserveAspectRatio={marker.preserveAspectRatio}
			opacity={marker.opacity}
		/>
	{/snippet}
</RowOffsetMarks>
