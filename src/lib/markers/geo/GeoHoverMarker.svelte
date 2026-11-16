<script lang="ts">
	import { Geo } from 'svelteplot';
	import { Paint } from '$lib/markers/utils/Paint';
	import GradientDefs from '$lib/markers/utils/GradientDefs.svelte';
	import ScaleFreeMarks from '$lib/layout/geometry/ScaleFreeMarks.svelte';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { GeoHoverMarkerConfig } from '$lib/types/markers/geo';
	import type { HoverPoint } from '$lib/types/layout/hover';

	/** Renders the hovered feature restyled in place - no dot, no label. `pointer-events: none` so it never steals hover from the base map underneath it. Drawn on the plot's projection and scales without joining them, so a feature entering or leaving it never lays the map out again. */
	let {
		marker,
		data
	}: { marker: GeoHoverMarkerConfig; data: HoverPoint<Record<string, unknown>>[] } = $props();

	const cfg = $derived(getConfiguration());
	const style = $derived({ ...cfg.hover.area, ...marker.styles });
	const id = $props.id();
	const fill = $derived(Paint.single(style.fill, undefined, `${id}-fill`));
	const stroke = $derived(Paint.single(style.stroke, undefined, `${id}-stroke`));
</script>

{#if data.length > 0}
	<ScaleFreeMarks>
		<GradientDefs paints={[fill, stroke]} />
		<Geo
			data={data.map((p) => p.row)}
			fill={fill.value}
			fillOpacity={style.fillOpacity}
			stroke={stroke.value}
			strokeWidth={style.strokeWidth}
			strokeOpacity={style.strokeOpacity}
			strokeDasharray={style.strokeDasharray}
			style="vector-effect: non-scaling-stroke; pointer-events: none;"
		/>
	</ScaleFreeMarks>
{/if}
