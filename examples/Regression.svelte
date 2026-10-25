<script lang="ts">
	import { ScatterPlot } from '@fundar/data-chart-telling';
	import { COUNTRIES_AT_2007 } from './datasets';
</script>

<!-- A linear regression with its 95% confidence band. -->
<ScatterPlot
	width={720}
	height={400}
	data={COUNTRIES_AT_2007}
	x="gdp"
	y="life"
	statistics={[{ type: 'regression', regressionType: 'linear', confidence: 0.95 }]}
/>
