<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import LinePlot from '$lib/plots/line/Plot.svelte';
	import BarPlot from '$lib/plots/bar/Plot.svelte';
	import { TIME_SERIES } from '../../../data/time-series';

	const gdp = TIME_SERIES.filter((d) => d.metric === 'GDP');
</script>

<PlotComposer
	width={900}
	height={440}
	title="One legend, one hover"
	subtitle="Toggling a region hides it in both plots; hovering a year highlights it in both"
	hover={{ sync: true }}
	layout={{ columns: 2, widths: [3, 2] }}
	legend={{ series: { title: 'region', interactive: { enabled: true } } }}
>
	<LinePlot data={gdp} x="year" y="value" color="region" tooltip />
	<BarPlot
		data={gdp}
		x="year"
		y="value"
		color="region"
		transforms={[{ type: 'stackY' }]}
		tooltip
	/>
</PlotComposer>
