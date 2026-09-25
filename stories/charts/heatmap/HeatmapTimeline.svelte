<script lang="ts">
	import HeatmapChart from '$lib/charts/heatmap/Chart.svelte';
	import Scrubber from '../../common/Scrubber.svelte';
	import { HEAT_CELLS, type HeatCell } from '../../data/heat-cells';
	import type { LegendSection } from '$lib/types/layout/legend';

	const { faceted = false }: { faceted?: boolean } = $props();

	const data = $derived(faceted ? HEAT_CELLS : HEAT_CELLS.filter((d) => d.scenario === 'Baseline'));

	const maxPct = Math.max(...HEAT_CELLS.map((d) => d.pct));
	const legend: LegendSection[] = [
		{
			type: 'continuous',
			title: 'Percentage',
			min: 0,
			max: maxPct,
			ticks: [maxPct * 0.25, maxPct * 0.5, maxPct * 0.75].map((v) => Math.round(v * 1000) / 1000),
			format: (v) => `${(v * 100).toFixed(0)}%`,
			width: 200
		}
	];
</script>

<Scrubber>
	{#snippet children({ progress })}
		<HeatmapChart
			width={760}
			height={520}
			title="Households by people and rooms"
			subtitle={faceted ? 'Shared timeline + facets by scenario' : 'Interactive timeline'}
			caption="Synthetic data. Drag the scrubber to change year."
			{data}
			x={'rooms' as keyof HeatCell}
			y={'people' as keyof HeatCell}
			color={'pct' as keyof HeatCell}
			scales={{ x: { label: 'Rooms' }, y: { label: 'People' } }}
			{legend}
			styles={{ values: { format: (v) => `${(v * 100).toFixed(0)}%` } }}
			facet={faceted ? { by: 'scenario' as keyof HeatCell, columns: 2 } : undefined}
			timeline={{ accessor: 'year', progress, orientation: 'vertical' }}
		/>
	{/snippet}
</Scrubber>
