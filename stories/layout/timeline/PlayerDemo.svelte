<script lang="ts">
	import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
	import { ARGENTINA_CHILE_TRENDS } from '$datasets';
</script>

<!--
	A timeline is a player unless `type` says otherwise: a bar in the chrome,
	below the plot by default, with play and pause, the current step and a slider.
-->
<BarPlot
	width={760}
	height={420}
	title="GDP per capita by country"
	data={ARGENTINA_CHILE_TRENDS.filter((d) => d.metric === 'GDP per capita')}
	x="country"
	y="value"
	scales={{ y: { domain: [0, 250] } }}
	timeline={{ accessor: 'year' }}
/>
