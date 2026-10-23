<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import { ARGENTINA_CHILE_TRENDS } from '$datasets';

	const north = ARGENTINA_CHILE_TRENDS.filter((d) => d.country === 'Argentina');
</script>

<PlotComposer
	width={900}
	height={480}
	title="Zooming into a range"
	subtitle="The inset repeats the data with a narrower x domain"
>
	<LinePlot data={north} x="year" y="value" color="metric" scales={{ y: { domain: [0, 250] } }} />
	<LinePlot
		inset={{ left: 0.1, bottom: 0.52, right: 0.42, top: 0.95 }}
		subtitle="2002-2007"
		data={north.filter((d) => d.year >= 2002)}
		x="year"
		y="value"
		color="metric"
		scales={{ x: { domain: [2002, 2007] } }}
	/>
</PlotComposer>
