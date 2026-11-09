<script lang="ts">
	import { Dot } from 'svelteplot';
	import type { HoverDisplayPoint } from '$lib/types/layout/hover';

	/**
	 * A ring around each hovered point - a component in a `hover` marker's `front` gets the hovered points as its
	 * `data`, and draws them with the plot's own scales.
	 */
	let { data = [], radius = 12 }: { data?: HoverDisplayPoint[]; radius?: number } = $props();
</script>

<Dot
	{data}
	x={(point: HoverDisplayPoint) => point.x}
	y={(point: HoverDisplayPoint) => point.y}
	r={radius}
	fill="none"
	stroke={(point: HoverDisplayPoint) => point.color ?? 'currentColor'}
	strokeWidth={2}
/>
