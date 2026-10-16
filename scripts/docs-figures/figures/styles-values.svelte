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
	styles={{
		values: {
			show: true,
			format: (value, seriesName) => `${seriesName}: ${value.toFixed(0)}`,
			fontStyle: { fontSize: 13 }
		}
	}}
/>
