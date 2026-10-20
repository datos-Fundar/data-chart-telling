<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { PRICES } from './data';
</script>

<!-- A plot carries its own chrome: title, subtitle, legend and caption. -->
<LinePlot
	width={720}
	height={440}
	title="Commodity prices"
	subtitle="Price index, January 2021 = 100"
	caption="Source: IMF, Primary Commodity Prices"
	data={PRICES}
	x="date"
	y="index"
	color="commodity"
/>
