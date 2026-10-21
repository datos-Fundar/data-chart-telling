<script lang="ts">
	import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
	import TooltipCard from '../../../common/TooltipCard.svelte';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { paletteColor } from '$lib/utils/color';
	import { COUNTRIES, type CountryPoint } from './data';

	const cfg = getConfiguration();

	// Region order matches `color`'s first-appearance order in COUNTRIES, which
	// is what drives colour assignment inside ScatterPlot - kept in lockstep here
	// since `content` only gets the raw row back, not its resolved colour.
	const REGIONS = ['Americas', 'Europe', 'Asia', 'Africa'] as const;
	const REGION_COLORS = REGIONS.map((_, i) => paletteColor(i, cfg.palette));
	const colorFor = (region: CountryPoint['region']) => REGION_COLORS[REGIONS.indexOf(region)];
</script>

{#snippet content({ rows }: { rows: CountryPoint[] })}
	{@const row = rows[0]}
	{#if row}
		{@const color = colorFor(row.region)}
		<TooltipCard
			heading={row.country}
			entries={[
				{ label: 'Region', color, value: 0, display: row.region },
				{
					label: 'GDP per capita',
					color,
					value: row.gdpPerCapita,
					display: `$${row.gdpPerCapita.toFixed(1)}k`
				},
				{
					label: 'Life expectancy',
					color,
					value: row.lifeExpectancy,
					display: `${row.lifeExpectancy.toFixed(1)} yr`
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
		data={COUNTRIES}
		x="gdpPerCapita"
		y="lifeExpectancy"
		color="region"
		tooltip={{
			sync: false,
			format: (row) => {
				const { country, gdpPerCapita, lifeExpectancy } = row as CountryPoint;
				return `${country}: $${gdpPerCapita.toFixed(1)}k, ${lifeExpectancy.toFixed(1)} yr`;
			},
			content
		}}
	/>
</div>
