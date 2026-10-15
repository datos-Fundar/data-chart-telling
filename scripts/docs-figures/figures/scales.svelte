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
	scales={{
		x: { label: 'Month' },
		y: { label: 'Index (Jan 2021 = 100)', domain: [90, 280], grid: true },
		color: {
			scheme: { Food: '#1b9e77', Transport: '#d95f02', Housing: '#7570b3', Health: '#e7298a' }
		}
	}}
/>
