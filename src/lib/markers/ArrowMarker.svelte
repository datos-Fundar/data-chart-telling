<script lang="ts">
	import { Arrow } from 'svelteplot';
	import type { ArrowMarkerConfig } from '$lib/types/markers/common';

	/** Renders one `'arrow'` marker as `<Arrow>` — a point-to-point annotation. Restates svelteplot's own defaults, which an explicit `undefined` would otherwise erase. */
	let { marker }: { marker: ArrowMarkerConfig } = $props();

	const data = $derived(marker.data ?? []);
</script>

<Arrow
	{data}
	x1={marker.x1}
	y1={marker.y1}
	x2={marker.x2}
	y2={marker.y2}
	bend={marker.bend}
	headAngle={marker.headAngle ?? 60}
	headLength={marker.headLength ?? 8}
	inset={marker.inset ?? 0}
	insetStart={marker.insetStart}
	insetEnd={marker.insetEnd}
	sweep={marker.sweep}
	stroke={marker.styles?.stroke ?? 'currentColor'}
	strokeWidth={marker.styles?.strokeWidth}
	strokeOpacity={marker.styles?.strokeOpacity}
	strokeDasharray={marker.styles?.strokeDasharray}
/>
