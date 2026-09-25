<script lang="ts">
	import PyramidChart from '$lib/charts/pyramid/Chart.svelte';
	import Scrubber from '../../common/Scrubber.svelte';
	import {
		AGE_GROUPS,
		POPULATION_PYRAMID,
		type PopulationRow
	} from '../../data/population-pyramid';
	import type { LegendSection } from '$lib/types/layout/legend';

	const legend: LegendSection[] = [
		{
			type: 'discrete',
			items: [
				{ name: 'Female', color: '#d6336c', symbol: 'square' },
				{ name: 'Male', color: '#1971c2', symbol: 'square' }
			],
			columns: 2
		}
	];
</script>

<Scrubber>
	{#snippet children({ progress })}
		<PyramidChart
			width={680}
			height={560}
			title="Population pyramid, interpolated"
			subtitle="Interactive timeline — each bar crossfades between censuses instead of jumping"
			caption="The years between 1991 and 2040 have irregular gaps: `interpolate: true` tweens each age-group/side's value across them."
			data={POPULATION_PYRAMID}
			y={'ageGroup' as keyof PopulationRow}
			x={'pct' as keyof PopulationRow}
			color={'sex' as keyof PopulationRow}
			scales={{
				y: { domain: AGE_GROUPS },
				color: { scheme: { Female: '#d6336c', Male: '#1971c2' } }
			}}
			styles={{
				values: { format: (v) => `${v.toFixed(1)}%` }
			}}
			{legend}
			timeline={{ accessor: 'year', progress, orientation: 'vertical', interpolate: true }}
		/>
	{/snippet}
</Scrubber>
