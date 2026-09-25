<script lang="ts">
	import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
	import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
	import { provideLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import { AMERICAS, EUROPE } from './data';

	// `disabled: { mode: 'omit' }` removes a toggled-off region entirely.
	provideLegendInteraction();
</script>

<div class="legend-demo">
	<LegendLayout
		sections={[
			{
				type: 'discrete',
				title: 'Region',
				interactive: { enabled: true, disabled: { mode: 'omit' } },
				items: [
					{ name: 'Americas', symbol: 'circle' },
					{ name: 'Europe', symbol: 'circle' }
				]
			}
		]}
	/>
	<ScatterPlot
		width={950}
		height={500}
		data={[...AMERICAS, ...EUROPE]}
		x="gdpPerCapita"
		y="lifeExpectancy"
		color="region"
	/>
</div>

<style>
	.legend-demo {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
