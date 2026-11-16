<script lang="ts">
	import { MarkerEvents } from '$lib/markers/utils/MarkerEvents';
	import { Paint } from '$lib/markers/utils/Paint';
	import GradientDefs from '$lib/markers/utils/GradientDefs.svelte';
	import { DifferenceY } from 'svelteplot';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { DifferenceMarkerConfig } from '$lib/types/markers/common';

	/**
	 * Renders one `'difference'` marker as `<DifferenceY>` - no horizontal
	 * counterpart exists in svelteplot, so this always renders vertically.
	 * svelteplot spreads its props over its defaults, so an explicit `undefined`
	 * would erase them - each default is restated here instead, its fills from the configuration's `difference`.
	 */
	let { marker }: { marker: DifferenceMarkerConfig } = $props();
	const events = MarkerEvents.use(() => marker);
	const cfg = $derived(getConfiguration());

	const data = $derived(marker.data ?? []);
	const id = $props.id();
	const positive = $derived(
		Paint.single(marker.positiveFill ?? cfg.difference.positiveFill, undefined, `${id}-positive`)
	);
	const negative = $derived(
		Paint.single(marker.negativeFill ?? cfg.difference.negativeFill, undefined, `${id}-negative`)
	);
</script>

<GradientDefs paints={[positive, negative]} />
<DifferenceY
	{...events.props}
	{data}
	x={marker.x}
	x1={marker.x1}
	x2={marker.x2}
	y={marker.y}
	y1={marker.y1}
	y2={marker.y2}
	curve={marker.curve ?? 'linear'}
	tension={marker.tension ?? 0}
	positiveFill={positive.value}
	positiveFillOpacity={marker.positiveFillOpacity ?? cfg.difference.positiveFillOpacity}
	negativeFill={negative.value}
	negativeFillOpacity={marker.negativeFillOpacity ?? cfg.difference.negativeFillOpacity}
/>
