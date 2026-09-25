<script lang="ts">
	import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { makeColorScale } from '$lib/utils/color';
	import TooltipCard from '../../common/TooltipCard.svelte';
	import { LIFE_EXPECTANCY_BY_PROVINCE_SEX, type ProvinceSexCell } from './data';

	const cfg = getConfiguration();

	const COLOR_DOMAIN: [number, number] = [70, 85];
	const colorScale = makeColorScale(
		COLOR_DOMAIN[0],
		COLOR_DOMAIN[1],
		cfg.continuous.min,
		cfg.continuous.max
	);
</script>

{#snippet content({ rows }: { rows: ProvinceSexCell[] })}
	{@const row = rows[0]}
	{#if row}
		<TooltipCard
			heading="{row.province} — {row.sex}"
			entries={[
				{
					label: 'Life expectancy',
					color: colorScale(row.value),
					value: row.value,
					display: `${row.value.toFixed(1)} yr`
				}
			]}
			footer="Life expectancy at birth"
		/>
	{/if}
{/snippet}

<div class="rich-tooltip-demo">
	<HeatmapPlot
		width={950}
		height={420}
		series={[
			{
				name: 'life_expectancy',
				x: 'province',
				y: 'sex',
				color: 'value',
				data: LIFE_EXPECTANCY_BY_PROVINCE_SEX
			}
		]}
		scales={{ color: { domain: COLOR_DOMAIN } }}
		tooltip={{
			facetId: '',
			sync: false,
			format: (row) => {
				const { province, sex, value } = row as ProvinceSexCell;
				return `${province} — ${sex}: ${value.toFixed(1)} yr`;
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
