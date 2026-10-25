<script lang="ts">
	import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
	import { COUNTRIES_AT_2007 } from '$datasets';
</script>

<!--
	The markers' own channels join the legend: a ramp for a numeric `color`,
	one item per category for a categorical one.
-->
<div style="display: flex; flex-direction: column; gap: 24px;">
	<ScatterPlot
		width={760}
		height={360}
		title="A numeric color: a ramp"
		data={COUNTRIES_AT_2007}
		x="gdp"
		y="life"
		markers={[{ type: 'dot', data: COUNTRIES_AT_2007, x: 'gdp', y: 'life', color: 'population' }]}
	/>
	<ScatterPlot
		width={760}
		height={360}
		title="A categorical color: an item per category"
		data={COUNTRIES_AT_2007}
		x="gdp"
		y="life"
		markers={[{ type: 'dot', data: COUNTRIES_AT_2007, x: 'gdp', y: 'life', color: 'continent' }]}
	/>
</div>
