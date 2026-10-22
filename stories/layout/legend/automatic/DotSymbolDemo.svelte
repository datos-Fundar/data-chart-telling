<script lang="ts">
	import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
	import { COUNTRIES_AT_2007 } from '$datasets';
</script>

<!--
	Dots that take their shape from a category (`symbol`) add a symbol
	section: each category next to its shape.
-->
<div style="display: flex; flex-direction: column; gap: 24px;">
	<ScatterPlot
		width={760}
		height={360}
		title="Shape by continent"
		data={COUNTRIES_AT_2007}
		x="gdp"
		y="life"
		symbol="continent"
		segments={{ default: [{ styles: { dotRadius: 5 } }] }}
	/>
	<ScatterPlot
		width={760}
		height={360}
		title="Shape by continent, size by population"
		data={COUNTRIES_AT_2007}
		x="gdp"
		y="life"
		symbol="continent"
		r="population"
		segments={{
			default: [{ styles: { dotFill: 'none', dotStroke: '#7c3aed', dotStrokeWidth: 1.25 } }]
		}}
	/>
</div>
