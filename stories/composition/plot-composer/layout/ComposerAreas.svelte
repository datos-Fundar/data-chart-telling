<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import LinePlot from '$lib/plots/line/Plot.svelte';
	import BarPlot from '$lib/plots/bar/Plot.svelte';
	import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
	import { TIME_SERIES } from '../../../data/time-series';
	import { REGION_BARS } from '../../../data/region-bars';
	import { COUNTRIES } from '../../../plots/scatter/data';
</script>

<PlotComposer
	width={900}
	height={560}
	title="Three views, one figure"
	subtitle="layout.areas: ['a a b', 'a a c'], tagged A, B, C"
	caption="Source: synthetic demo data."
	tags="A"
	layout={{ areas: ['a a b', 'a a c'] }}
>
	<LinePlot
		area="a"
		data={TIME_SERIES.filter((d) => d.region === 'North')}
		x="year"
		y="value"
		color="metric"
		tooltip
	/>
	<BarPlot area="b" data={REGION_BARS.filter((d) => d.year === 2022)} x="region" y="value" />
	<ScatterPlot area="c" data={COUNTRIES} x="gdpPerCapita" y="lifeExpectancy" color="region" />
</PlotComposer>
