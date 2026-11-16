<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from './datasets';
</script>

<!--
	`tooltip` turns the floating box on (`true` for the defaults, or an object
	to tune it); a `hover` marker draws the in-plot crosshair, dot and label.
-->
<LinePlot
	width={720}
	height={400}
	data={REGION_VALUES}
	x="date"
	y="value"
	color="region"
	tooltip={{ strategy: 'x', format: (context) => `${context.row.region}: ${context.row.value}` }}
	markers={[{ type: 'hover' }]}
/>
