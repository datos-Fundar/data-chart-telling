<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import PlotPanel from '$lib/layout/composer/PlotPanel.svelte';
	import LinePlot from '$lib/plots/line/Plot.svelte';
	import BarPlot from '$lib/plots/bar/Plot.svelte';
	import { TIME_SERIES } from '../../../data/time-series';
	import { REGION_BARS } from '../../../data/region-bars';
</script>

<PlotComposer
	width={900}
	height={480}
	title="An inset over a larger plot"
	subtitle="PlotPanel inset: left 0.62, bottom 0.5, right 0.98, top 0.98"
>
	<PlotPanel>
		{#snippet children({ width, height })}
			<LinePlot
				{width}
				{height}
				data={TIME_SERIES.filter((d) => d.region === 'North')}
				x="year"
				y="value"
				color="metric"
				scales={{ y: { domain: [0, 160] } }}
			/>
		{/snippet}
	</PlotPanel>
	<PlotPanel inset={{ left: 0.62, bottom: 0.5, right: 0.98, top: 0.98 }}>
		{#snippet children({ width, height })}
			<BarPlot
				{width}
				{height}
				data={REGION_BARS.filter((d) => d.year === 2022)}
				x="region"
				y="value"
			/>
		{/snippet}
	</PlotPanel>
</PlotComposer>
