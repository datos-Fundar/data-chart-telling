<script lang="ts">
	import { ScatterPlot } from '@fundar/data-chart-telling';
	import { COUNTRIES_AT_2007 } from './datasets';
</script>

<!-- Points sized by `r`, colored by `color` and shaped by `symbol`. -->
<ScatterPlot
	width={720}
	height={420}
	data={COUNTRIES_AT_2007}
	x="gdp"
	y="life"
	r="population"
	color="continent"
	symbol="income"
/>
