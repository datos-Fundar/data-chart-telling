<script lang="ts">
	import { PlotComposer, LinePlot, BarPlot, ScatterPlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES, PROVINCE_VALUES, COUNTRIES } from '../data';
</script>

<PlotComposer
	width={900}
	height={560}
	title="Three views, one figure"
	legend={false}
	tags="A"
	layout={{ areas: ['a a b', 'a a c'] }}
>
	<LinePlot area="a" data={REGION_VALUES} x="year" y="value" color="region" tooltip />
	<BarPlot
		area="b"
		data={PROVINCE_VALUES.filter((r) => r.sex === 'female').slice(0, 3)}
		x="province"
		y="value"
	/>
	<ScatterPlot area="c" data={COUNTRIES} x="gdp" y="life" />
</PlotComposer>
