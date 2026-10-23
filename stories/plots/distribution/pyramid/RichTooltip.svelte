<script lang="ts">
	import PyramidPlot from '$lib/plots/distribution/pyramid/Plot.svelte';
	import type { TooltipRow } from '$lib/types/layout/tooltip';
	import TooltipCard from '../../../common/TooltipCard.svelte';
	import { AGE_GROUPS, POPULATION_BY_AGE, type AgeRow } from '$datasets';

	const DATA = POPULATION_BY_AGE.filter((d) => d.year === 2022);
</script>

{#snippet content({ rows }: { rows: TooltipRow<AgeRow>[] })}
	{@const ageGroup = rows[0]?.ageGroup}
	{@const entries = rows
		.map((row) => ({
			label: row.sex,
			color: row.seriesColor ?? 'currentColor',
			value: row.share,
			display: `${row.share.toFixed(1)}%`
		}))
		.sort((a, b) => b.value - a.value)}
	<TooltipCard heading={ageGroup} {entries} footer="Share of total population" />
{/snippet}

<div class="rich-tooltip-demo">
	<PyramidPlot
		width={950}
		height={520}
		data={DATA}
		x="share"
		y="ageGroup"
		color="sex"
		scales={{ y: { domain: AGE_GROUPS } }}
		tooltip={{
			sync: false,
			format: (row) => {
				const { sex, ageGroup, share } = row as AgeRow;
				return `${sex} - ${ageGroup}: ${share.toFixed(1)}%`;
			},
			content
		}}
	/>
</div>
