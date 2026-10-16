<script lang="ts">
	import { BarPlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from '../data';
</script>

<BarPlot
	width={720}
	height={340}
	data={REGION_VALUES.filter((r) => r.year % 2 === 0)}
	x="year"
	y="value"
	facet={{ by: 'region', columns: 3, mode: 'carousel', visible: 2, navLayout: 'below' }}
/>
