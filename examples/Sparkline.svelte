<script lang="ts">
	import { SparklinePlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from './datasets';
</script>

<!-- One sparkline per region: monthly inflation as a thin line, with its last value beside a dot. -->
<SparklinePlot
	width={360}
	height={300}
	data={REGION_VALUES}
	x="date"
	y="value"
	facet={{ by: 'region', columns: 1, gap: 4 }}
/>
