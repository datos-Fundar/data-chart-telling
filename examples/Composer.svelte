<script lang="ts">
	import { PlotComposer, LinePlot, BarPlot, ScatterPlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES, PROVINCE_VALUES, COUNTRIES_AT_2007 } from './datasets';
</script>

<!-- Several plots in one figure, placed on named areas of a grid. -->
<PlotComposer
	width={900}
	height={560}
	title="Three views, one figure"
	legend={false}
	tags="A"
	layout={{ areas: ['a a b', 'a a c'] }}
>
	<LinePlot area="a" data={REGION_VALUES} x="date" y="value" color="region" tooltip />
	<BarPlot
		area="b"
		data={PROVINCE_VALUES.filter((row) => row.sex === 'female').slice(0, 3)}
		x="province"
		y="value"
	/>
	<ScatterPlot area="c" data={COUNTRIES_AT_2007} x="gdp" y="life" />
</PlotComposer>
