<script lang="ts">
	import { LinePlot, getConfiguration, paletteColor } from '@fundar/data-chart-telling';
	import TooltipCard from './TooltipCard.svelte';
	import { REGION_VALUES, type RegionRow } from './datasets';

	const { palette } = getConfiguration();
	const regions = [...new Set(REGION_VALUES.map((row) => row.region))];
</script>

<!--
	`content` replaces the tooltip text with your own markup, drawn in a plain
	card: TooltipCard brings its own background, colors and spacing. It is given
	every row the hover matched, in no particular order, so it sorts them itself;
	series colors come from the configuration's palette.
-->
{#snippet content({ rows }: { rows: RegionRow[] })}
	<TooltipCard
		heading={rows[0].date.toLocaleDateString('en-US', {
			month: 'long',
			year: 'numeric',
			timeZone: 'UTC'
		})}
		footer="Monthly inflation (%)"
		entries={[...rows]
			.sort((a, b) => b.value - a.value)
			.map((row) => ({
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
	data={REGION_VALUES}
	x="date"
	y="value"
	color="region"
	tooltip={{ strategy: 'x', content }}
	markers={[{ type: 'hover' }]}
/>
