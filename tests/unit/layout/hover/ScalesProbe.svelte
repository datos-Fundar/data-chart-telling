<script lang="ts">
	import { usePlot } from '$lib/layout/plot/usePlot';

	/**
	 * A `component` marker that reports each scales object svelteplot works out for its plot - a new one every time
	 * it computes them again from the plot's marks.
	 */
	let { onScales }: { onScales: (scales: unknown) => void } = $props();

	const plot = usePlot();

	$effect(() => {
		onScales(plot.svelteplot.scales);
	});
</script>
