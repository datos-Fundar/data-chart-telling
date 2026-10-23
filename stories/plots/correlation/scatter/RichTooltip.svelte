<script lang="ts">
	import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
	import TooltipCard from '../../../common/TooltipCard.svelte';
	import type { TooltipRow } from '$lib/types/layout/tooltip';
	import { COUNTRIES_AT_2007, type CountryYearRow } from '$datasets';
</script>

{#snippet content({ rows }: { rows: TooltipRow<CountryYearRow>[] })}
	{@const row = rows[0]}
	{#if row}
		{@const color = row.seriesColor ?? 'currentColor'}
		<TooltipCard
			heading={row.country}
			entries={[
				{ label: 'Continent', color, value: 0, display: row.continent },
				{
					label: 'GDP per capita',
					color,
					value: row.gdp,
					display: `$${(row.gdp / 1000).toFixed(1)}k`
				},
				{
					label: 'Life expectancy',
					color,
					value: row.life,
					display: `${row.life.toFixed(1)} yr`
				}
			]}
			footer={`Population: ${row.population}M`}
		/>
	{/if}
{/snippet}

<div class="rich-tooltip-demo">
	<ScatterPlot
		width={950}
		height={500}
		data={COUNTRIES_AT_2007}
		x="gdp"
		y="life"
		color="continent"
		tooltip={{
			sync: false,
			format: (row) => {
				const { country, gdp, life } = row as CountryYearRow;
				return `${country}: $${(gdp / 1000).toFixed(1)}k, ${life.toFixed(1)} yr`;
			},
			content
		}}
	/>
</div>
