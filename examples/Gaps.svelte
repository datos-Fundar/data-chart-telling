<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { LIFE_GAPS } from './datasets';
</script>

<!-- Missing values bridged: dashed in the middle, faded at the start, extended to the 2025 projection at the end. -->
<LinePlot
	width={720}
	height={400}
	series={[{ name: 'female', x: 'year', y: 'value', data: LIFE_GAPS }]}
	scales={{ x: { edgeTicks: true }, y: { domain: [55, 85] } }}
	styles={{
		gaps: {
			default: {
				middle: { interpolate: 'linear', style: { stroke: { strokeDasharray: '4 4' } } },
				start: { x: 1940, style: { stroke: { strokeOpacity: 0.4 } } },
				end: { x: 2025, y: 81.1 }
			}
		}
	}}
/>
