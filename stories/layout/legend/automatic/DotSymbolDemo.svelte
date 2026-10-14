<script lang="ts">
	import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
	import { COUNTRIES } from '../../../plots/scatter/data';
</script>

<!--
	Dots that take their shape from a category (`symbol`) add a symbol
	section: each category next to its shape.
-->
<div style="display: flex; flex-direction: column; gap: 24px;">
	<ScatterPlot
		width={760}
		height={360}
		title="Shape by region"
		data={COUNTRIES}
		x="gdpPerCapita"
		y="lifeExpectancy"
		symbol="region"
		segments={{ default: [{ styles: { dotRadius: 5 } }] }}
	/>
	<ScatterPlot
		width={760}
		height={360}
		title="Shape by region, size by population"
		data={COUNTRIES}
		x="gdpPerCapita"
		y="lifeExpectancy"
		symbol="region"
		r="population"
		segments={{
			default: [{ styles: { dotFill: 'none', dotStroke: '#7c3aed', dotStrokeWidth: 1.25 } }]
		}}
	/>
</div>
