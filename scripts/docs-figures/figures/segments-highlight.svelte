<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from '../data';

	const north = REGION_VALUES.filter((r) => r.region === 'North');
</script>

<LinePlot
	width={720}
	height={380}
	series={[{ name: 'North', x: 'year', y: 'value', data: north }]}
	segments={{
		North: [
			{ styles: { stroke: { stroke: '#94a3b8', strokeWidth: 1 } } },
			{
				areas: [{ x: { from: 2019, to: 2021 } }],
				styles: { stroke: { stroke: '#ef4444', strokeWidth: 3 } }
			}
		]
	}}
/>
