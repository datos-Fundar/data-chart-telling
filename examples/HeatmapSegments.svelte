<script lang="ts">
	import { HeatmapPlot } from '@fundar/data-chart-telling';
	import { HOUSEHOLDS } from './data';
</script>

<!-- Segments on a heatmap: an outlined column and a filled block of overcrowded households. -->
<HeatmapPlot
	width={560}
	height={360}
	data={HOUSEHOLDS}
	x="rooms"
	y="people"
	color="share"
	segments={{
		default: [
			{
				areas: [{ x: { from: '1', to: '1' } }],
				styles: { stroke: '#f59e0b', strokeWidth: 2 }
			},
			{
				areas: [{ x: { from: '1', to: '2' }, y: { from: '4', to: '5+' } }],
				styles: { fill: '#ef4444', fillOpacity: 0.8 }
			}
		]
	}}
/>
