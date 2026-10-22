<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
	import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
	import { COUNTRIES_OVER_TIME } from '$datasets';

	const COUNTRIES_2007 = COUNTRIES_OVER_TIME.filter((d) => d.year === 2007);
</script>

<PlotComposer
	width={900}
	height={560}
	title="Three views, one figure"
	subtitle="layout.areas: ['a a b', 'a a c'], tagged A, B, C"
	caption="Source: Gapminder."
	tags="A"
	layout={{ areas: ['a a b', 'a a c'] }}
>
	<LinePlot
		area="a"
		data={COUNTRIES_OVER_TIME}
		x="year"
		y="life"
		color="continent"
		transforms={[{ type: 'groupX', y: 'mean' }]}
		tooltip
	/>
	<BarPlot
		area="b"
		data={COUNTRIES_2007}
		x="continent"
		y="population"
		color="continent"
		transforms={[{ type: 'groupX', y: 'sum' }, { type: 'stackY' }]}
		scales={{ x: { label: false } }}
	/>
	<ScatterPlot area="c" data={COUNTRIES_2007} x="gdp" y="life" color="continent" />
</PlotComposer>
