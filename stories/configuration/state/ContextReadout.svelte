<script lang="ts">
	import { usePlot } from '$lib/layout/plot/usePlot';
	import type { RowContextOf } from '$lib';
	import type HistogramPlot from '$lib/plots/distribution/histogram/Plot.svelte';

	// Mounted as a `component` marker: `usePlot().contextOf` reads what the plot knows of the hovered bin, which
	// `RowContextOf` names from the plot it is mounted in.
	const plot = usePlot();

	const bin = $derived(
		plot.hover.activePoint &&
			plot.contextOf<RowContextOf<typeof HistogramPlot>>(plot.hover.activePoint.row)
	);
</script>

<text x={plot.margins.left + 8} y={plot.margins.top + 16} font-size="13" fill="currentColor">
	{#if bin}
		Bin {bin.from}-{bin.to}: {bin.count}
	{:else}
		Hover a bin
	{/if}
</text>
