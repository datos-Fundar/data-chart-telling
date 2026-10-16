<script lang="ts">
	import { AreaPlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from '../data';
</script>

<AreaPlot
	width={720}
	height={400}
	data={REGION_VALUES}
	x="year"
	y="value"
	color="region"
	transforms={[{ type: 'stackY' }]}
/>
