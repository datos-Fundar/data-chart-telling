<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from './data';
</script>

<!-- The smallest useful plot: rows, the fields to map and a pixel size. -->
<LinePlot width={720} height={400} data={REGION_VALUES} x="date" y="value" color="region" />
