<script lang="ts">
	import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
	import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
	import TooltipCard from '../../../common/TooltipCard.svelte';
	import type { TooltipRow } from '$lib/types/layout/tooltip';
	import { AGE_SHARES_BY_YEAR, type AgeShareRow } from '$datasets';
</script>

{#snippet content({ rows }: { rows: TooltipRow<AgeShareRow>[] })}
	{@const year = rows[0]?.year}
	{@const entries = rows
		.map((row) => ({
			label: row.ageGroup,
			color: row.seriesColor ?? 'currentColor',
			value: row.share,
			display: `${row.share.toFixed(1)}%`
		}))
		.sort((a, b) => b.value - a.value)}
	<TooltipCard
		heading={String(year)}
		{entries}
		footer="Share of the population by broad age group"
	/>
{/snippet}

<div class="rich-tooltip-demo">
	<BarPlot
		width={900}
		height={900}
		data={AGE_SHARES_BY_YEAR}
		x="share"
		y="year"
		color="ageGroup"
		scales={{
			y: { type: 'band' },
			color: { scheme: 'RdBu' }
		} satisfies AxisBasedScalesConfig}
		transforms={[{ type: 'stackX' }]}
		markers={[{ type: 'hover', showLabels: false }]}
		tooltip={{
			sync: false,
			format: (row) => {
				const { year, ageGroup, share } = row as AgeShareRow;
				return `${year} / ${ageGroup}: ${share}`;
			},
			content
		}}
	/>
</div>
