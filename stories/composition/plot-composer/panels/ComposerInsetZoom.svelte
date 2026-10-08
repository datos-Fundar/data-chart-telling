<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import PlotPanel from '$lib/layout/composer/PlotPanel.svelte';
	import LinePlot from '$lib/plots/line/Plot.svelte';
	import { TIME_SERIES } from '../../../data/time-series';

	const north = TIME_SERIES.filter((d) => d.region === 'North');
</script>

<PlotComposer
	width={900}
	height={480}
	title="Zooming into a range"
	subtitle="The inset repeats the data with a narrower x domain"
>
	<PlotPanel>
		{#snippet children({ width, height })}
			<LinePlot
				{width}
				{height}
				data={north}
				x="year"
				y="value"
				color="metric"
				scales={{ y: { domain: [0, 160] } }}
			/>
		{/snippet}
	</PlotPanel>
	<PlotPanel inset={{ left: 0.1, bottom: 0.52, right: 0.42, top: 0.95 }}>
		{#snippet children({ width, height })}
			<LinePlot
				{width}
				{height}
				subtitle="2021–2022"
				data={north.filter((d) => d.year >= 2021)}
				x="year"
				y="value"
				color="metric"
				scales={{ x: { domain: [2021, 2022] } }}
			/>
		{/snippet}
	</PlotPanel>
</PlotComposer>
