<script lang="ts">
	import { ScatterPlot } from '@fundar/data-chart-telling';
	import { COUNTRIES } from '../data';
</script>

<ScatterPlot
	width={720}
	height={400}
	data={COUNTRIES}
	x="gdp"
	y="life"
	statistics={[{ type: 'regression', regressionType: 'linear', confidence: 0.95 }]}
/>
