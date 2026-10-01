<script lang="ts">
	import { Density } from 'svelteplot';
	import type { DensityMarkerConfig } from '$lib/types/markers/common';

	/**
	 * Renders one `'density'` marker as `<Density>` — 2D KDE contour bands.
	 * svelteplot's own `Density` puts no class on its rendered group unless
	 * given one, so this wrapper sets `class="density"` for the same
	 * class-based scoping every other marker kind gets from svelteplot itself.
	 */
	let { marker }: { marker: DensityMarkerConfig } = $props();

	const data = $derived(marker.data ?? []);
</script>

<Density
	{data}
	class="density"
	x={marker.x}
	y={marker.y}
	weight={marker.weight}
	z={marker.grouping}
	bandwidth={marker.bandwidth}
	thresholds={marker.thresholds}
	fill={marker.styles?.fill}
	fillOpacity={marker.styles?.fillOpacity}
	stroke={marker.styles?.stroke}
	strokeWidth={marker.styles?.strokeWidth}
	strokeOpacity={marker.styles?.strokeOpacity}
/>
