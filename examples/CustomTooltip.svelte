<script lang="ts">
	import { LinePlot, getConfiguration, paletteColor } from '@fundar/data-chart-telling';
	import TooltipCard from './TooltipCard.svelte';
	import { ROWS, type Row } from './data';

	const { palette } = getConfiguration();
	const regions = [...new Set(ROWS.map((d) => d.region))];
</script>

<!--
	`content` replaces the tooltip text with your own markup, drawn in a plain
	card: TooltipCard brings its own background, colors and spacing. It is given
	every row the hover matched; series colors come from the configuration's palette.
-->
{#snippet content({ rows }: { rows: Row[] })}
	<TooltipCard
		heading={String(rows[0].year)}
		footer="Value by region"
		entries={rows.map((row) => ({
			label: row.region,
			color: paletteColor(regions.indexOf(row.region), palette),
			value: row.value,
			display: String(row.value)
		}))}
	/>
{/snippet}

<LinePlot
	width={720}
	height={400}
	data={ROWS}
	x="year"
	y="value"
	color="region"
	tooltip={{ strategy: 'x', content }}
	markers={[{ type: 'hover' }]}
/>
