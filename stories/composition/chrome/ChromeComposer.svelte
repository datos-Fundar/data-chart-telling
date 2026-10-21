<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import { TIME_SERIES } from '../../data/time-series';
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
				{ name: 'GDP', symbol: 'line' },
				{ name: 'Employment', symbol: 'line' }
			]
		}
	];
</script>

<PlotComposer
	width={900}
	height={480}
	title="GDP vs. Employment"
	subtitle="North region vs South region, 2018-2022"
	caption="Source: synthetic demo data."
	{legend}
	order={['divider', 'legend', 'caption', 'divider', 'plot', 'divider', 'title', 'subtitle']}
	layout={{ columns: 2 }}
>
	{#each ['North', 'South'] as region (region)}
		<LinePlot
			title={region}
			data={TIME_SERIES.filter((d) => d.region === region)}
			x="year"
			y="value"
			color="metric"
		/>
	{/each}
</PlotComposer>
