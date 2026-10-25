<script lang="ts">
	import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { ColorRamp } from '$lib/utils/color';
	import TooltipCard from '../../../common/TooltipCard.svelte';
	import { PENGUIN_COUNTS, type PenguinSpeciesCount } from '$datasets';

	const cfg = getConfiguration();

	const COLOR_DOMAIN: [number, number] = [0, 120];
	const colorScale = ColorRamp.between(
		COLOR_DOMAIN[0],
		COLOR_DOMAIN[1],
		cfg.continuous.min,
		cfg.continuous.max
	);
</script>

{#snippet content({ rows }: { rows: PenguinSpeciesCount[] })}
	{@const row = rows[0]}
	{#if row}
		<TooltipCard
			heading="{row.island} - {row.species}"
			entries={[
				{
					label: 'Penguins',
					color: colorScale(row.count),
					value: row.count,
					display: `${row.count} penguins`
				}
			]}
			footer="Palmer Station penguins"
		/>
	{/if}
{/snippet}

<div class="rich-tooltip-demo">
	<HeatmapPlot
		width={950}
		height={420}
		series={[
			{
				name: 'penguins',
				x: 'island',
				y: 'species',
				color: 'count',
				data: PENGUIN_COUNTS
			}
		]}
		scales={{ color: { domain: COLOR_DOMAIN } }}
		tooltip={{
			sync: false,
			format: (row) => {
				const { island, species, count } = row as PenguinSpeciesCount;
				return `${island} - ${species}: ${count} penguins`;
			},
			content
		}}
	/>
</div>

<style>
	.rich-tooltip-demo {
		--dct-tooltip-radius: 0.75rem;
	}
</style>
