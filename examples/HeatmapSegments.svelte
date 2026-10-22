<script lang="ts">
	import { HeatmapPlot } from '@fundar/data-chart-telling';
	import { PENGUIN_COUNTS } from './datasets';
</script>

<!-- Segments on a heatmap: an outlined column and a filled block of cells. -->
<HeatmapPlot
	width={560}
	height={360}
	data={PENGUIN_COUNTS}
	x="island"
	y="species"
	color="count"
	segments={{
		default: [
			{
				areas: [{ x: { from: 'Biscoe', to: 'Biscoe' } }],
				styles: { stroke: '#f59e0b', strokeWidth: 2 }
			},
			{
				areas: [{ x: { from: 'Dream', to: 'Torgersen' }, y: { from: 'Chinstrap', to: 'Gentoo' } }],
				styles: { fill: '#ef4444', fillOpacity: 0.8 }
			}
		]
	}}
/>
