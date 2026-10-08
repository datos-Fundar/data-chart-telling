<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import PlotPanel from '$lib/layout/composer/PlotPanel.svelte';
	import LinePlot from '$lib/plots/line/Plot.svelte';
	import BarPlot from '$lib/plots/bar/Plot.svelte';
	import { TIME_SERIES } from '../../../data/time-series';
	import { REGION_BARS } from '../../../data/region-bars';

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
	<PlotPanel>
		{#snippet children({ width, height })}
			<LinePlot {width} {height} data={north} x="year" y="value" color="metric" />
		{/snippet}
	</PlotPanel>
	<PlotPanel>
		{#snippet children({ width, height })}
			<PlotComposer {width} {height} tags="i" layout={{ columns: 2 }}>
				{#each [2018, 2022] as year (year)}
					<PlotPanel>
						{#snippet children({ width, height })}
							<BarPlot
								{width}
								{height}
								subtitle={String(year)}
								data={REGION_BARS.filter((d) => d.year === year)}
								x="region"
								y="value"
							/>
						{/snippet}
					</PlotPanel>
				{/each}
			</PlotComposer>
		{/snippet}
	</PlotPanel>
</PlotComposer>
