<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from './data';

	const gba = REGION_VALUES.filter((row) => row.region === 'GBA');
</script>

<!-- A grey line with the 2023-2024 surge drawn in red. -->
<LinePlot
	width={720}
	height={380}
	series={[{ name: 'GBA', x: 'date', y: 'value', data: gba }]}
	segments={{
		GBA: [
			{ styles: { stroke: { stroke: '#94a3b8', strokeWidth: 1 } } },
			{
				areas: [{ x: { from: new Date('2023-07-01'), to: new Date('2024-03-01') } }],
				styles: { stroke: { stroke: '#ef4444', strokeWidth: 3 } }
			}
		]
	}}
/>
