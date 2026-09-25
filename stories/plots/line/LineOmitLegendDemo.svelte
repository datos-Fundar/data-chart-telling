<script lang="ts">
	import LinePlot from '$lib/plots/line/Plot.svelte';
	import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
	import { provideLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import { FEMALE_LIFE_EXPECTANCY, MALE_LIFE_EXPECTANCY } from './data';

	// `disabled: { mode: 'omit' }` removes a toggled-off series entirely.
	provideLegendInteraction();
</script>

<div class="legend-demo">
	<LegendLayout
		sections={[
			{
				type: 'discrete',
				title: 'Sex',
				interactive: { enabled: true, disabled: { mode: 'omit' } },
				items: [
					{ name: 'female', label: 'Female', symbol: 'line' },
					{ name: 'male', label: 'Male', symbol: 'line' }
				]
			}
		]}
	/>
	<LinePlot
		width={950}
		height={400}
		series={[
			{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY },
			{ name: 'male', x: 'year', y: 'value', data: MALE_LIFE_EXPECTANCY }
		]}
	/>
</div>

<style>
	.legend-demo {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
