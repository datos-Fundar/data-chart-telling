<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
	import { ARGENTINA_CHILE_TRENDS } from '$datasets';

	const gdp = ARGENTINA_CHILE_TRENDS.filter((d) => d.metric === 'GDP per capita');
</script>

<PlotComposer
	width={900}
	height={440}
	title="One legend, one hover"
	subtitle="Toggling a country hides it in both plots; hovering a year highlights it in both"
	hover={{ sync: true }}
	layout={{ columns: 2, widths: [3, 2] }}
	legend={{ series: { title: 'country', interactive: { enabled: true } } }}
>
	<LinePlot data={gdp} x="year" y="value" color="country" tooltip />
	<BarPlot
		data={gdp}
		x="year"
		y="value"
		color="country"
		transforms={[{ type: 'stackY' }]}
		tooltip
	/>
</PlotComposer>
