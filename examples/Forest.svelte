<script lang="ts">
	import { ForestPlot } from '@fundar/data-chart-telling';
	import { INFLATION_RANGES } from './data';
</script>

<!-- One row per region and year: the mean monthly inflation as a dot, on a stem from its lowest to its highest month. -->
<ForestPlot
	width={720}
	height={480}
	data={INFLATION_RANGES}
	x="mean"
	y="period"
	lower="min"
	upper="max"
	color="region"
	scales={{ x: { label: 'Monthly inflation (%)' } }}
/>
