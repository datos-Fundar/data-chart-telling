<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { PRICES } from '../data';
</script>

<LinePlot
	width={720}
	height={400}
	data={PRICES}
	x="date"
	y="index"
	color="division"
	legend={{ series: { interactive: { enabled: true, disabled: { mode: 'omit' } } } }}
/>
