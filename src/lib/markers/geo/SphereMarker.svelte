<script lang="ts">
	import { MarkerEvents } from '$lib/markers/utils/MarkerEvents';
	import { Paint } from '$lib/markers/utils/Paint';
	import GradientDefs from '$lib/markers/utils/GradientDefs.svelte';
	import { Sphere } from 'svelteplot';
	import type { GeoSphereMarkerConfig } from '$lib/types/markers/geo';

	/** Renders one `'sphere'` marker - the outer globe outline. */
	let { marker }: { marker: GeoSphereMarkerConfig } = $props();
	const events = MarkerEvents.use(() => marker);
	const id = $props.id();
	const fill = $derived(Paint.single(marker.styles?.fill, undefined, `${id}-fill`));
	const stroke = $derived(Paint.single(marker.styles?.stroke, undefined, `${id}-stroke`));
</script>

<GradientDefs paints={[fill, stroke]} />
<Sphere
	{...events.props}
	fill={fill.value}
	fillOpacity={marker.styles?.fillOpacity}
	stroke={stroke.value ?? 'currentColor'}
	strokeWidth={marker.styles?.strokeWidth ?? 1}
	style="vector-effect: non-scaling-stroke"
/>
