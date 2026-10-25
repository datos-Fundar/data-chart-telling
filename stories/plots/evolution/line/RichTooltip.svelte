<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import type { TooltipRow } from '$lib/types/layout/tooltip';
	import TooltipCard from '../../../common/TooltipCard.svelte';
	import { FEMALE_LIFE, MALE_LIFE, type LifeRow } from '$datasets';
</script>

{#snippet content({ rows }: { rows: TooltipRow<LifeRow>[] })}
	{@const year = rows[0]?.year}
	{@const entries = rows
		.map((row) => ({
			label: row.sex === 'female' ? 'Female' : 'Male',
			color: row.seriesColor ?? 'currentColor',
			value: row.value,
			display: `${row.value.toFixed(1)} yr`
		}))
		.sort((a, b) => b.value - a.value)}
	<TooltipCard heading={String(year)} {entries} footer="Life expectancy at birth" />
{/snippet}

<div class="rich-tooltip-demo">
	<LinePlot
		width={950}
		height={400}
		scales={{ x: { nice: false } }}
		series={[
			{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE },
			{ name: 'male', x: 'year', y: 'value', data: MALE_LIFE }
		]}
		tooltip={{
			sync: false,
			format: (row) => {
				const { year, value } = row as LifeRow;
				return `${year}: ${value.toFixed(1)} yr`;
			},
			content
		}}
	/>
</div>
