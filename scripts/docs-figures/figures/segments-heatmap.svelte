<script lang="ts">
	import { HeatmapPlot } from '@fundar/data-chart-telling';
	import { SALES } from '../data';
</script>

<HeatmapPlot
	width={560}
	height={360}
	data={SALES}
	x="quarter"
	y="product"
	color="sales"
	segments={{
		default: [
			{
				areas: [{ x: { from: 'Q1', to: 'Q1' } }, { x: { from: 'Q3', to: 'Q3' } }],
				styles: { stroke: '#f59e0b', strokeWidth: 2 }
			},
			{
				areas: [{ x: { from: 'Q2', to: 'Q2' }, y: { from: 'Alpha', to: 'Beta' } }],
				styles: { fill: '#ef4444', fillOpacity: 0.8 }
			}
		]
	}}
/>
