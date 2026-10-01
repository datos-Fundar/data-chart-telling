<script lang="ts">
	import { Raster } from 'svelteplot';
	import type { RasterMarkerConfig } from '$lib/types/markers/common';

	/**
	 * Renders one `'raster'` marker as `<Raster>`. An empty `data` means
	 * svelteplot's function-sampling mode (`fill` as `(x, y) => value`, no rows),
	 * so it is forwarded as `null` rather than an empty array.
	 */
	let { marker }: { marker: RasterMarkerConfig } = $props();

	const data = $derived(marker.data?.length ? marker.data : null);
</script>

<Raster
	{data}
	x={marker.x}
	y={marker.y}
	fill={marker.fill}
	fillOpacity={marker.fillOpacity}
	x1={marker.x1}
	x2={marker.x2}
	y1={marker.y1}
	y2={marker.y2}
	width={marker.width}
	height={marker.height}
	pixelSize={marker.pixelSize}
	blur={marker.blur}
	interpolate={marker.interpolate}
	imageRendering={marker.imageRendering}
/>
