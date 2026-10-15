<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from '../data';
</script>

<LinePlot
	width={720}
	height={400}
	data={REGION_VALUES}
	x="year"
	y="value"
	color="region"
	timeline={{ accessor: 'year', type: 'rule', progress: 0.55 }}
/>
