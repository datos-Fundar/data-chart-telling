<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
	import { ARGENTINA_CHILE_TRENDS } from '$datasets';

	const data = ARGENTINA_CHILE_TRENDS.filter((d) => d.metric === 'GDP per capita');
</script>

<!-- One player for every panel: the composer's `timeline` takes the same `type` and `player`. -->
<PlotComposer
	width={900}
	height={480}
	title="One player, two plots"
	timeline={{
		values: [1987, 1992, 1997, 2002, 2007],
		type: 'player',
		player: { controls: ['play', 'value', 'slider', 'speed'], loop: true }
	}}
	layout={{ columns: 2, widths: [3, 2] }}
>
	<LinePlot
		{data}
		x="year"
		y="value"
		color="country"
		scales={{ x: { domain: [1987, 2007] }, y: { domain: [0, 250] } }}
		timeline={{ accessor: 'year', filterMode: 'upTo' }}
	/>
	<BarPlot
		{data}
		x="country"
		y="value"
		scales={{ y: { domain: [0, 250] } }}
		timeline={{ accessor: 'year' }}
	/>
</PlotComposer>
