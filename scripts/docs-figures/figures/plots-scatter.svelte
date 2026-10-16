<script lang="ts">
	import { ScatterPlot } from '@fundar/data-chart-telling';
	import { COUNTRIES } from '../data';
</script>

<ScatterPlot
	width={720}
	height={420}
	data={COUNTRIES}
	x="gdp"
	y="life"
	r="population"
	color="continent"
	symbol="income"
/>
