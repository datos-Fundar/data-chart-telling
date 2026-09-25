<script lang="ts">
	import LinePlot from '$lib/plots/line/Plot.svelte';
	import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
	import { provideLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import type { GapsConfig } from '$lib/types/plots/gaps';
	import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
	import { FEMALE_LIFE_EXPECTANCY_WITH_GAPS, MALE_LIFE_EXPECTANCY_WITH_GAPS } from './data';

	// Same context wiring as `LineValuesLegendDemo.svelte` — registers the
	// legend-interaction store `BaseChart` would otherwise provide, so
	// `LegendLayout` and `LinePlot` can be composed as plain siblings here.
	provideLegendInteraction();
</script>

<div class="legend-demo">
	<LegendLayout
		sections={[
			{
				type: 'discrete',
				title: 'Sex',
				interactive: { enabled: true },
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
			{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY_WITH_GAPS },
			{ name: 'male', x: 'year', y: 'value', data: MALE_LIFE_EXPECTANCY_WITH_GAPS }
		]}
		styles={{
			gaps: { default: { middle: {} } } satisfies GapsConfig<LineSegmentStyle>
		}}
	/>
</div>

<style>
	.legend-demo {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
