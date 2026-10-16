<script lang="ts">
	import { usePlot } from '$lib/layout/plot/usePlot';

	// Mounted as a `component` marker, so it draws inside the plot's SVG, where `usePlot()` is reachable.
	const plot = usePlot();

	const point = $derived(plot.hover.activePoint);
</script>

<text x={plot.margins.left + 8} y={plot.margins.top + 16} font-size="13" fill="currentColor">
	{#if point}
		{point.series ?? 'value'} at {String(point.x)}: {point.label}
	{:else}
		Hover the plot ({plot.data.length} rows, {Math.round(plot.width)} x {Math.round(plot.height)} px)
	{/if}
</text>
