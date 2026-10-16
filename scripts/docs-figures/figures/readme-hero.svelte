<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from '../data';

	const rows = REGION_VALUES.filter((r) => r.region !== 'Center');
</script>

<LinePlot
	width={720}
	height={400}
	title="Value by region"
	data={rows}
	x="year"
	y="value"
	color="region"
	tooltip
	scales={{ x: { label: false } }}
	styles={{ values: { show: true } }}
/>
