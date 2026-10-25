<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import type { TooltipRow } from '$lib/types/layout/tooltip';
	import TooltipCard from '../../common/TooltipCard.svelte';
	import { ARGENTINA_CHILE_TRENDS, type CountryTrendRow } from '$datasets';

	const data = ARGENTINA_CHILE_TRENDS.filter((d) => d.country === 'Argentina');
</script>

{#snippet content({ rows }: { rows: TooltipRow<CountryTrendRow>[] })}
	{@const year = rows[0]?.year}
	{@const entries = rows
		.map((row) => ({
			label: row.metric,
			color: row.seriesColor ?? 'currentColor',
			value: row.value,
			display: `Index ${row.value}`
		}))
		.sort((a, b) => b.value - a.value)}
	<TooltipCard heading={String(year)} {entries} footer="GDP per capita vs. population" />
{/snippet}

<div class="custom-content-demo">
	<LinePlot
		width={680}
		height={440}
		{data}
		x="year"
		y="value"
		color={'metric' as keyof CountryTrendRow}
		tooltip={{ strategy: 'x', content }}
		markers={[{ type: 'hover' }]}
	/>
</div>
