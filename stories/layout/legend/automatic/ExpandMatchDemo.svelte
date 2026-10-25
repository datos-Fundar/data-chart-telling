<script lang="ts">
	import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
	import { COUNTRIES_AT_2007 } from '$datasets';
</script>

<!--
	Two markers color by different fields, so the legend has two ramps.
	`match` picks the one to adjust by its title - the field name, or the
	name of the function that computes the channel.
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
			color: 'life'
		}
	]}
	legend={{
		color: [
			{ match: 'population', title: 'People (millions)', width: 240 },
			{ match: 'life', title: 'Years', width: 160 }
		]
	}}
/>
