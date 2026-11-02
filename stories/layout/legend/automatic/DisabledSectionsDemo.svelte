<script lang="ts">
	import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
	import { COUNTRIES_AT_2007 } from '$datasets';
</script>

<!--
	Two markers color by different fields, so the legend has two ramps.
	`enabled: false` leaves the one matching `life` off the legend; the
	other stays.
-->
<ScatterPlot
	width={760}
	height={400}
	data={COUNTRIES_AT_2007}
	x="gdp"
	y="life"
	markers={[
		{ type: 'dot', data: COUNTRIES_AT_2007, x: 'gdp', y: 'life', color: 'population' },
		{
			type: 'dot',
			data: COUNTRIES_AT_2007,
			x: 'gdp',
			y: 'life',
			color: 'life',
			scales: { color: { scheme: 'warm' } }
		}
	]}
	legend={{
		color: [{ match: 'life', enabled: false }]
	}}
/>
