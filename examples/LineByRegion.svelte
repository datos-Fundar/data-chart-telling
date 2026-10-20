<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from './data';
</script>

<!-- One line per region, with a title, the automatic legend, end-of-line values and a tooltip. -->
<LinePlot
	width={720}
	height={400}
	title="Monthly inflation by region (%)"
	data={REGION_VALUES}
	x="date"
	y="value"
	color="region"
	tooltip
	scales={{ x: { label: false } }}
	styles={{ values: { show: true } }}
/>
