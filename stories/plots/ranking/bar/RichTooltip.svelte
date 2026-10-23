<script lang="ts">
	import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
	import type { TooltipRow } from '$lib/types/layout/tooltip';
	import TooltipCard from '../../../common/TooltipCard.svelte';
	import { FEMALE_PROVINCE_VALUES, MALE_PROVINCE_VALUES, type ProvinceRow } from '$datasets';
</script>

{#snippet content({ rows }: { rows: TooltipRow<ProvinceRow>[] })}
	{@const province = rows[0]?.province}
	{@const entries = rows
		.map((row) => ({
			label: row.sex === 'female' ? 'Female' : 'Male',
			color: row.seriesColor ?? 'currentColor',
			value: row.value,
			display: `${row.value.toFixed(1)} yr`
		}))
		.sort((a, b) => b.value - a.value)}
	<TooltipCard heading={province} {entries} footer="Life expectancy at birth" />
{/snippet}

<div class="rich-tooltip-demo">
	<BarPlot
		width={950}
		height={500}
		series={[
			{ name: 'female', x: 'province', y: 'value', data: FEMALE_PROVINCE_VALUES },
			{ name: 'male', x: 'province', y: 'value', data: MALE_PROVINCE_VALUES }
		]}
		tooltip={{
			sync: false,
			format: (row) => {
				const { province, value } = row as ProvinceRow;
				return `${province}: ${value.toFixed(1)} yr`;
			},
			content
		}}
	/>
</div>
