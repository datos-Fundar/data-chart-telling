<script lang="ts">
	import PyramidChart from '$lib/charts/pyramid/Chart.svelte';
	import Scrubber from '../../common/Scrubber.svelte';
	import {
		AGE_GROUPS,
		POPULATION_PYRAMID,
		type PopulationRow
	} from '../../data/population-pyramid';
	import type { LegendSection } from '$lib/types/layout/legend';

	/** Age groups dimmed to focus attention — mirrors the old per-chart `highlight: string[]` prop. */
	const { highlight = [] as string[] }: { highlight?: string[] } = $props();

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

	const segments = $derived(
		highlight.length === 0
			? undefined
			: Object.fromEntries(
					(['Female', 'Male'] as const).map((name) => [
						name,
						AGE_GROUPS.map((ageGroup) => ({
							areas: [{ y: { from: ageGroup, to: ageGroup } }],
							style: { fillOpacity: highlight.includes(ageGroup) ? 1 : 0.25 }
						}))
					])
				)
	);
</script>

<Scrubber>
	{#snippet children({ progress })}
		<PyramidChart
			width={680}
			height={560}
			title="Population pyramid"
			subtitle="Percentage of age range over total population"
			caption="Synthetic data. Drag the scrubber to change year."
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
			{segments}
			{legend}
			timeline={{ accessor: 'year', progress, orientation: 'vertical' }}
		/>
	{/snippet}
</Scrubber>
