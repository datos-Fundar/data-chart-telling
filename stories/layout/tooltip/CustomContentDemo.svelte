<script lang="ts">
	import LineChart from '$lib/charts/line/Chart.svelte';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { paletteColor } from '$lib/utils/color';
	import TooltipCard from '../../common/TooltipCard.svelte';
	import { TIME_SERIES, type SeriesPoint } from '../../data/time-series';

	const cfg = getConfiguration();

	// Matches the `z: 'metric'` grouping order below, which is what drives
	// colour assignment inside LineChart — kept in lockstep here since `content`
	// only gets the raw rows back, not their series colour.
	const METRICS = ['PBI', 'Empleo'];
	const METRIC_COLORS = [paletteColor(0, cfg.palette), paletteColor(1, cfg.palette)];

	const data = TIME_SERIES.filter((d) => d.region === 'Norte');
</script>

{#snippet content({ rows }: { rows: SeriesPoint[] })}
	{@const year = rows[0]?.year}
	{@const entries = rows
		.map((row) => ({
			label: row.metric,
			color: METRIC_COLORS[METRICS.indexOf(row.metric)],
			value: row.value,
			display: `$ ${row.value} M`
		}))
		.sort((a, b) => b.value - a.value)}
	<TooltipCard heading={String(year)} {entries} footer="PBI vs. Empleo" />
{/snippet}

<div class="custom-content-demo">
	<LineChart
		width={680}
		height={440}
		{data}
		x="year"
		y="value"
		z={'metric' as keyof SeriesPoint}
		tooltip={{ strategy: 'x', content }}
		markers={[{ type: 'hover' }]}
	/>
</div>
