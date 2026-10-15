<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { PRICES } from '../data';
</script>

<LinePlot
	width={720}
	height={460}
	title="Consumer prices"
	subtitle="Index by division"
	caption="Source: synthetic data"
	data={PRICES}
	x="date"
	y="index"
	color="division"
	order={['title', 'subtitle', 'divider', 'legend', 'plot', 'divider', 'caption']}
/>
