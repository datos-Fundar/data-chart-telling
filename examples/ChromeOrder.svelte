<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { PRICES } from './data';
</script>

<!-- `order` places the chrome blocks; `divider` draws a rule between them. -->
<LinePlot
	width={720}
	height={460}
	title="Commodity prices"
	subtitle="Price index"
	caption="Source: IMF, Primary Commodity Prices"
	data={PRICES}
	x="date"
	y="index"
	color="commodity"
	order={['title', 'subtitle', 'divider', 'legend', 'plot', 'divider', 'caption']}
/>
