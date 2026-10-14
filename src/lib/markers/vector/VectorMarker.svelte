<script lang="ts">
	import { Vector } from 'svelteplot';
	import type { GeoVectorMarkerConfig } from '$lib/types/markers/geo';

	/**
	 * Renders one `'vector'` marker - arrows/spikes at points. `'arrow'`/`'spike'`
	 * draw an open (stroked) path - svelteplot itself resolves their default
	 * color via `stroke`, not `fill` (only `'arrow-filled'` is a closed, filled
	 * shape) - so the default color applies to whichever channel the active
	 * shape actually draws with, matching svelteplot's own convention.
	 */
	let { marker }: { marker: GeoVectorMarkerConfig } = $props();

	const shape = $derived(marker.shape ?? 'arrow-filled');
	const isFilledShape = $derived(shape === 'arrow-filled');
</script>

<Vector
	data={marker.data}
	x={marker.x}
	y={marker.y}
	length={marker.length}
	rotate={marker.rotate}
	{shape}
	anchor={marker.anchor}
	fill={marker.styles?.fill ?? (isFilledShape ? 'currentColor' : undefined)}
	stroke={marker.styles?.stroke ?? (isFilledShape ? undefined : 'currentColor')}
	strokeWidth={marker.styles?.strokeWidth}
/>
