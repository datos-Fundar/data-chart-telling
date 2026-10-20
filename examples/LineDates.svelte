<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { PRICES } from './data';
</script>

<!-- A line per commodity over a date axis, with end-of-line labels. -->
<LinePlot
	width={720}
	height={400}
	data={PRICES}
	x="date"
	y="index"
	color="commodity"
	styles={{ values: { show: true, format: (v, name) => `${name}: ${v}` } }}
/>
