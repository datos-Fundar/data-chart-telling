<script lang="ts">
	import AreaPlot from '$lib/plots/area/Plot.svelte';
	import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
	import { provideLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import { HEIGHT_DENSITY } from '../../data/height-density';

	// Registers the same context `BaseChart` provides internally — composing
	// `LegendLayout` and `AreaPlot` as siblings here, both descendants of this
	// component, is what lets toggling a legend item reach the plot.
	provideLegendInteraction();
</script>

<div class="legend-demo">
	<!-- Items follow the data's own series order (male first), since a legend
		 item takes its color from its position in this list. -->
	<LegendLayout
		sections={[
			{
				type: 'discrete',
				title: 'Sex',
				interactive: { enabled: true },
				items: [
					{ name: 'male', label: 'Male', symbol: 'square' },
					{ name: 'female', label: 'Female', symbol: 'square' }
				]
			}
		]}
	/>
	<AreaPlot width={950} height={400} data={HEIGHT_DENSITY} x="height" y="density" color="sex" />
</div>

<style>
	.legend-demo {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
