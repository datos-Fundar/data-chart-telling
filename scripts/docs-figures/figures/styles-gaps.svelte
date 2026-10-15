<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { LIFE_GAPS } from '../data';
</script>

<LinePlot
	width={720}
	height={400}
	series={[{ name: 'female', x: 'year', y: 'value', data: LIFE_GAPS }]}
	scales={{ y: { domain: [78, 88] } }}
	styles={{
		gaps: {
			default: {
				middle: { interpolate: 'linear', style: { stroke: { strokeDasharray: '4 4' } } },
				start: { x: 2007, style: { stroke: { strokeOpacity: 0.4 } } },
				end: { x: 2023, y: 85 }
			}
		}
	}}
/>
