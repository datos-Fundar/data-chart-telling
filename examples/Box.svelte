<script lang="ts">
	import { BoxPlot } from '@fundar/data-chart-telling';
	import { HEIGHTS } from './data';
</script>

<!-- One box per group: quartiles, median, whiskers and outliers of each height distribution. -->
<BoxPlot width={720} height={400} data={HEIGHTS} x="group" y="height" color="group" />
