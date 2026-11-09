<script lang="ts">
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { PointPixel } from '$lib/markers/utils/PointPixel';
	import type { HoverDisplayPoint } from '$lib/types/layout/hover';

	/**
	 * Where the hover is, rendered *inside* a `<Plot>`: it reports the pixel position of the point under the pointer,
	 * through the host plot's scales, so a synced plot's tooltip can sit on it. It draws nothing itself - the
	 * `hover` marker's `back` and `front` markers are drawn by `GeometryLayout`, as every other marker.
	 */
	interface Props {
		activePoint?: HoverDisplayPoint | null;
		/** Reports `activePoint`'s pixel position within this facet's own box, or `null` when nothing's matched. */
		onActivePointPixel?: (pos: { x: number; y: number } | null) => void;
	}

	let { activePoint = null, onActivePointPixel }: Props = $props();
	const plot = usePlot().svelteplot;

	const activePixel = $derived(activePoint ? PointPixel.of(plot.scales, activePoint) : null);

	$effect(() => {
		onActivePointPixel?.(activePixel);
	});
</script>
