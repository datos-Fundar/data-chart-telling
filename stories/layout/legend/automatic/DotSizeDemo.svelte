<script lang="ts">
	import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
	import { COUNTRIES } from '../../../plots/scatter/data';
</script>

<!--
	Dots that size by a value (`r`) add a size section: a few dots of the
	radius each value draws at, in the dots' own look.
-->
<div style="display: flex; flex-direction: column; gap: 24px;">
	<ScatterPlot
		width={760}
		height={360}
		title="Sized dots"
		data={COUNTRIES}
		x="gdpPerCapita"
		y="lifeExpectancy"
		color="region"
		r="population"
	/>
	<ScatterPlot
		width={760}
		height={360}
		title="Sized rings"
		data={COUNTRIES}
		x="gdpPerCapita"
		y="lifeExpectancy"
		r="population"
		segments={{
			default: [{ styles: { dotFill: 'none', dotStroke: '#0f766e', dotStrokeWidth: 1.25 } }]
		}}
	/>
	<ScatterPlot
		width={760}
		height={360}
		title="Sized stars"
		data={COUNTRIES}
		x="gdpPerCapita"
		y="lifeExpectancy"
		r="population"
		segments={{ default: [{ styles: { dotSymbol: 'star', dotFill: '#b45309' } }] }}
	/>
</div>
