<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
	import { TIME_SERIES } from '../../../data/time-series';
	import { AGE_SHARES } from '$datasets';

	const north = TIME_SERIES.filter((d) => d.region === 'North');
</script>

<!-- A full-width row over a nested composer of two columns. -->
<PlotComposer
	width={900}
	height={620}
	title="Nested composition"
	subtitle="A full-width panel over a nested two-column composer"
	tags="A"
	layout={{ columns: 1, heights: [1, 1] }}
>
	<LinePlot data={north} x="year" y="value" color="metric" />
	<PlotComposer layout={{ columns: 2 }}>
		{#each [1991, 2022] as year (year)}
			<BarPlot
				subtitle={String(year)}
				data={AGE_SHARES.filter((d) => d.year === year)}
				x="ageGroup"
				y="share"
				legend={false}
			/>
		{/each}
	</PlotComposer>
</PlotComposer>
