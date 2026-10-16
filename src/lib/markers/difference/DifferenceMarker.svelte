<script lang="ts">
	import { DifferenceY } from 'svelteplot';
	import type { DifferenceMarkerConfig } from '$lib/types/markers/common';

	/**
	 * Renders one `'difference'` marker as `<DifferenceY>` - no horizontal
	 * counterpart exists in svelteplot, so this always renders vertically.
	 * svelteplot spreads its props over its defaults, so an explicit `undefined`
	 * would erase them - each default is restated here instead.
	 */
	let { marker }: { marker: DifferenceMarkerConfig } = $props();

	const data = $derived(marker.data ?? []);
</script>

<DifferenceY
	{data}
	x={marker.x}
	x1={marker.x1}
	x2={marker.x2}
	y={marker.y}
	y1={marker.y1}
	y2={marker.y2}
	curve={marker.curve ?? 'linear'}
	tension={marker.tension ?? 0}
	positiveFill={marker.positiveFill ?? 'red'}
	positiveFillOpacity={marker.positiveFillOpacity ?? 1}
	negativeFill={marker.negativeFill ?? 'blue'}
	negativeFillOpacity={marker.negativeFillOpacity ?? 1}
/>
