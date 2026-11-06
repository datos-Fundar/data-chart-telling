<script lang="ts">
	import { MarkerEvents } from '$lib/markers/utils/MarkerEvents';
	import { Sphere } from 'svelteplot';
	import type { GeoSphereMarkerConfig } from '$lib/types/markers/geo';

	/** Renders one `'sphere'` marker - the outer globe outline. */
	let { marker }: { marker: GeoSphereMarkerConfig } = $props();
	const events = MarkerEvents.use(() => marker);
</script>

<Sphere
	{...events.props}
	fill={marker.styles?.fill}
	fillOpacity={marker.styles?.fillOpacity}
	stroke={marker.styles?.stroke ?? 'currentColor'}
	strokeWidth={marker.styles?.strokeWidth ?? 1}
	style="vector-effect: non-scaling-stroke"
/>
