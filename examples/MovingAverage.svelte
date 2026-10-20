<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { PRICES } from './data';
</script>

<!-- A 6-month moving average, run on the plot's rows. -->
<LinePlot
	width={720}
	height={400}
	data={PRICES}
	x="date"
	y="index"
	color="commodity"
	transforms={[{ type: 'windowY', k: 6, reduce: 'mean' }]}
/>
