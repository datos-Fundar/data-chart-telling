<script lang="ts">
	import AreaPlot from '$lib/plots/area/Plot.svelte';
	import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
	import { provideLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import { ENERGY_MIX } from '../../data/energy-mix';

	// Registers the same context `BaseChart` provides internally — composing
	// `LegendLayout` and `AreaPlot` as siblings here, both descendants of this
	// component, is what lets toggling a legend item reach the plot.
	provideLegendInteraction();
</script>

<!-- Items follow the data's own series order (coal first), since a legend
	item takes its color from its position in this list. -->
<div class="legend-demo">
	<LegendLayout
		sections={[
			{
				type: 'discrete',
				title: 'Source',
				interactive: { enabled: true },
				items: [
					{ name: 'coal', label: 'Coal', symbol: 'square' },
					{ name: 'gas', label: 'Gas', symbol: 'square' },
					{ name: 'nuclear', label: 'Nuclear', symbol: 'square' },
					{ name: 'hydro', label: 'Hydro', symbol: 'square' },
					{ name: 'renewables', label: 'Renewables', symbol: 'square' }
				]
			}
		]}
	/>
	<AreaPlot
		width={950}
		height={400}
		data={ENERGY_MIX}
		x="year"
		y="share"
		color="source"
		transforms={[{ type: 'stackY' }]}
		scales={{ y: { domain: [0, 100] } }}
	/>
</div>

<style>
	.legend-demo {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
