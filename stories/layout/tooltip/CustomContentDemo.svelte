<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { paletteColor } from '$lib/utils/color';
	import TooltipCard from '../../common/TooltipCard.svelte';
	import { ARGENTINA_CHILE_TRENDS, type CountryTrendRow } from '$datasets';

	const cfg = getConfiguration();

	// Matches the `color: 'metric'` grouping order below, which is what drives
	// colour assignment inside LinePlot - kept in lockstep here since `content`
	// only gets the raw rows back, not their series colour.
	const METRICS = ['GDP per capita', 'Population'];
	const METRIC_COLORS = [paletteColor(0, cfg.palette), paletteColor(1, cfg.palette)];

	const data = ARGENTINA_CHILE_TRENDS.filter((d) => d.country === 'Argentina');
</script>

{#snippet content({ rows }: { rows: CountryTrendRow[] })}
	{@const year = rows[0]?.year}
	{@const entries = rows
		.map((row) => ({
			label: row.metric,
			color: METRIC_COLORS[METRICS.indexOf(row.metric)],
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
