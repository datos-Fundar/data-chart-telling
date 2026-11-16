<script lang="ts">
	import { MarkerEvents } from '$lib/markers/utils/MarkerEvents';
	import { Paint } from '$lib/markers/utils/Paint';
	import GradientDefs from '$lib/markers/utils/GradientDefs.svelte';
	import { Graticule } from 'svelteplot';
	import type { GeoGraticuleMarkerConfig } from '$lib/types/markers/geo';

	/** Renders one `'graticule'` marker - longitude/latitude gridlines. */
	let { marker }: { marker: GeoGraticuleMarkerConfig } = $props();
	const events = MarkerEvents.use(() => marker);
	const id = $props.id();
	const stroke = $derived(Paint.single(marker.styles?.stroke, undefined, `${id}-stroke`));
</script>

<GradientDefs paints={[stroke]} />
<Graticule
	{...events.props}
	step={marker.step}
	stepX={marker.stepX}
	stepY={marker.stepY}
	stroke={stroke.value ?? 'currentColor'}
	strokeWidth={marker.styles?.strokeWidth ?? 0.5}
	strokeOpacity={marker.styles?.strokeOpacity ?? 0.3}
	strokeDasharray={marker.styles?.strokeDasharray}
	style="vector-effect: non-scaling-stroke"
/>
