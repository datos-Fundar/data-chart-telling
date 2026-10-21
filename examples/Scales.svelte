<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { PRICES } from './datasets';
</script>

<!-- Axis labels, a fixed domain with gridlines and a color per series. -->
<LinePlot
	width={720}
	height={400}
	data={PRICES}
	x="date"
	y="index"
	color="commodity"
	scales={{
		x: { label: 'Month' },
		y: { label: 'Index (Jan 2021 = 100)', domain: [0, 600], grid: true },
		color: {
			scheme: {
				'Brent oil': '#1b9e77',
				'Natural gas': '#d95f02',
				Coal: '#7570b3',
				Wheat: '#e7298a'
			}
		}
	}}
/>
