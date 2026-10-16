<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { ROWS } from './data';
</script>

<!--
	`tooltip` turns the floating box on (`true` for the defaults, or an object
	to tune it); a `hover` marker draws the in-plot crosshair, dot and label.
-->
<LinePlot
	width={720}
	height={400}
	data={ROWS}
	x="year"
	y="value"
	color="region"
	tooltip={{ strategy: 'x', format: (row) => `${row.region}: ${row.value}` }}
	markers={[{ type: 'hover' }]}
/>
