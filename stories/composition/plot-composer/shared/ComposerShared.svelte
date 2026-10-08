<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import PlotPanel from '$lib/layout/composer/PlotPanel.svelte';
	import LinePlot from '$lib/plots/line/Plot.svelte';
	import BarPlot from '$lib/plots/bar/Plot.svelte';
	import { TIME_SERIES } from '../../../data/time-series';
	import type { LegendSection } from '$lib/types/layout/legend';

	const gdp = TIME_SERIES.filter((d) => d.metric === 'GDP');
	const legend: LegendSection[] = [
		{
			type: 'discrete',
			title: 'Region',
			interactive: { enabled: true },
			items: [{ name: 'North' }, { name: 'South' }]
		}
	];
</script>

<PlotComposer
	width={900}
	height={440}
	title="One legend, one hover"
	subtitle="Toggling a region hides it in both plots; hovering a year highlights it in both"
	{legend}
	hover={{ sync: true }}
	layout={{ columns: 2, widths: [3, 2] }}
>
	<PlotPanel>
		{#snippet children({ width, height })}
			<LinePlot {width} {height} data={gdp} x="year" y="value" color="region" tooltip />
		{/snippet}
	</PlotPanel>
	<PlotPanel>
		{#snippet children({ width, height })}
			<BarPlot
				{width}
				{height}
				data={gdp}
				x="year"
				y="value"
				color="region"
				transforms={[{ type: 'stackY' }]}
				tooltip
			/>
		{/snippet}
	</PlotPanel>
</PlotComposer>
