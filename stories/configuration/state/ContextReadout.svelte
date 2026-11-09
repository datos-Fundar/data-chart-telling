<script lang="ts">
	import { usePlot } from '$lib/layout/plot/usePlot';
	import type { HistogramRowContext } from '$lib/types/plots/distribution/histogram/props';

	// Mounted as a `component` marker: `usePlot().contextOf` reads what the plot knows of the hovered bin.
	const plot = usePlot();

	const bin = $derived(
		plot.hover.activePoint && plot.contextOf<HistogramRowContext>(plot.hover.activePoint.row)
	);
</script>

<text x={plot.margins.left + 8} y={plot.margins.top + 16} font-size="13" fill="currentColor">
	{#if bin}
		Bin {bin.from}-{bin.to}: {bin.count}
	{:else}
		Hover a bin
	{/if}
</text>
