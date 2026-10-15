<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from '../data';
</script>

<LinePlot
	width={900}
	height={300}
	data={REGION_VALUES}
	x="year"
	y="value"
	facet={{ by: 'region', columns: 3, gap: 12 }}
/>
