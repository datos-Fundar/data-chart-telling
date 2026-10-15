<script lang="ts">
	import { BarPlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from '../data';
</script>

<BarPlot
	width={720}
	height={400}
	data={REGION_VALUES}
	x="region"
	y="value"
	scales={{ y: { domain: [0, 200] } }}
	timeline={{ accessor: 'year', progress: 0.55 }}
/>
