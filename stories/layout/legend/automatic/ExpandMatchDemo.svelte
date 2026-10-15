<script lang="ts">
	import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
	import { COUNTRIES } from '../../../plots/scatter/data';
</script>

<!--
	Two markers color by different fields, so the legend has two ramps.
	`match` picks the one to adjust by its title - the field name, or the
	name of the function that computes the channel.
-->
<ScatterPlot
	width={760}
	height={400}
	data={COUNTRIES}
	x="gdpPerCapita"
	y="lifeExpectancy"
	markers={[
		{ type: 'dot', data: COUNTRIES, x: 'gdpPerCapita', y: 'lifeExpectancy', color: 'population' },
		{
			type: 'dot',
			data: COUNTRIES,
			x: 'gdpPerCapita',
			y: 'lifeExpectancy',
			color: 'lifeExpectancy'
		}
	]}
	legend={{
		color: [
			{ match: 'population', title: 'People (millions)', width: 240 },
			{ match: 'lifeExpectancy', title: 'Years', width: 160 }
		]
	}}
/>
