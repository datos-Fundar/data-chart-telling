<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import PlotPanel from '$lib/layout/composer/PlotPanel.svelte';
	import LinePlot from '$lib/plots/line/Plot.svelte';
	import BarPlot from '$lib/plots/bar/Plot.svelte';
	import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
	import { TIME_SERIES } from '../../../data/time-series';
	import { REGION_BARS } from '../../../data/region-bars';
	import { COUNTRIES } from '../../../plots/scatter/data';
</script>

<PlotComposer
	width={900}
	height={560}
	title="Three views, one figure"
	subtitle="layout.areas: ['a a b', 'a a c'], tagged A, B, C"
	caption="Source: synthetic demo data."
	tags="A"
	layout={{ areas: ['a a b', 'a a c'] }}
>
	<PlotPanel area="a">
		{#snippet children({ width, height })}
			<LinePlot
				{width}
				{height}
				data={TIME_SERIES.filter((d) => d.region === 'North')}
				x="year"
				y="value"
				color="metric"
				tooltip
			/>
		{/snippet}
	</PlotPanel>
	<PlotPanel area="b">
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
	<PlotPanel area="c">
		{#snippet children({ width, height })}
			<ScatterPlot
				{width}
				{height}
				data={COUNTRIES}
				x="gdpPerCapita"
				y="lifeExpectancy"
				color="region"
			/>
		{/snippet}
	</PlotPanel>
</PlotComposer>
