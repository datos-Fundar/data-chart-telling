<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import { ARGENTINA_CHILE_TRENDS } from '$datasets';
	import type { LegendSection } from '$lib/types/layout/legend';

	/**
	 * A composition takes the same chrome props as a plot - `title`,
	 * `subtitle`, `caption`, `legend`, `order` and dividers - around its panels,
	 * and each panel's plot keeps its own chrome inside its box.
	 */
	const legend: LegendSection[] = [
		{
			type: 'discrete',
			title: 'Indicator',
			columns: 2,
			items: [
				{ name: 'GDP per capita', symbol: 'line' },
				{ name: 'Population', symbol: 'line' }
			]
		}
	];
</script>

<PlotComposer
	width={900}
	height={480}
	title="GDP per capita vs. population"
	subtitle="Argentina vs Chile, 1987-2007 (index, 1987 = 100)"
	caption="Source: synthetic demo data."
	{legend}
	order={['divider', 'legend', 'caption', 'divider', 'plot', 'divider', 'title', 'subtitle']}
	layout={{ columns: 2 }}
>
	{#each ['Argentina', 'Chile'] as country (country)}
		<LinePlot
			title={country}
			data={ARGENTINA_CHILE_TRENDS.filter((d) => d.country === country)}
			x="year"
			y="value"
			color="metric"
		/>
	{/each}
</PlotComposer>
