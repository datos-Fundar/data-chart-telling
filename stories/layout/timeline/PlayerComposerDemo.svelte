<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
	import { TIME_SERIES } from '../../data/time-series';

	const data = TIME_SERIES.filter((d) => d.metric === 'GDP');
</script>

<!-- One player for every panel: the composer's `timeline` takes the same `type` and `player`. -->
<PlotComposer
	width={900}
	height={480}
	title="One player, two plots"
	timeline={{
		values: [2018, 2019, 2020, 2021, 2022],
		type: 'player',
		player: { controls: ['play', 'value', 'slider', 'speed'], loop: true }
	}}
	layout={{ columns: 2, widths: [3, 2] }}
>
	<LinePlot
		{data}
		x="year"
		y="value"
		color="region"
		scales={{ x: { domain: [2018, 2022] }, y: { domain: [0, 100] } }}
		timeline={{ accessor: 'year', filterMode: 'upTo' }}
	/>
	<BarPlot
		{data}
		x="region"
		y="value"
		scales={{ y: { domain: [0, 100] } }}
		timeline={{ accessor: 'year' }}
	/>
</PlotComposer>
