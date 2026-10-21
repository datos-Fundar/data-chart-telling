<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import GridCell from '$lib/layout/grid/GridCell.svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';

	const DATA = [2018, 2019, 2020].map((year, i) => ({ year, value: 10 + i }));
</script>

<!-- A plot straight in the composer, one inside a GridCell, and a nested composer of two. -->
<PlotComposer width={900} height={400} tags="A" layout={{ columns: 3 }}>
	<LinePlot data={DATA} x="year" y="value" />
	<GridCell>
		{#snippet children({ width, height })}
			<LinePlot {width} {height} data={DATA} x="year" y="value" />
		{/snippet}
	</GridCell>
	<PlotComposer tags="i" layout={{ columns: 1 }}>
		<LinePlot data={DATA} x="year" y="value" />
		<LinePlot data={DATA} x="year" y="value" />
	</PlotComposer>
</PlotComposer>
