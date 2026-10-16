<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { PRICES } from '../data';
</script>

<LinePlot
	width={720}
	height={440}
	title="Consumer prices"
	subtitle="Index by division, January 2021 = 100"
	caption="Source: synthetic data"
	data={PRICES}
	x="date"
	y="index"
	color="division"
/>
