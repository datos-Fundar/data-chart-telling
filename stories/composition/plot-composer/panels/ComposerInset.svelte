<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
	import { ARGENTINA_CHILE_TRENDS } from '$datasets';
	import { AGE_SHARES } from '$datasets';
</script>

<PlotComposer
	width={900}
	height={480}
	title="An inset over a larger plot"
	subtitle="inset: left 0.62, bottom 0.5, right 0.98, top 0.98"
>
	<LinePlot
		data={ARGENTINA_CHILE_TRENDS.filter((d) => d.country === 'Argentina')}
		x="year"
		y="value"
		color="metric"
		scales={{ y: { domain: [0, 250] } }}
	/>
	<BarPlot
		inset={{ left: 0.62, bottom: 0.5, right: 0.98, top: 0.98 }}
		data={AGE_SHARES.filter((d) => d.year === 2022)}
		x="ageGroup"
		y="share"
	/>
</PlotComposer>
