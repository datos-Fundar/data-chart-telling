<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from './data';
</script>

<!-- A carousel shows `visible` panels at a time, with navigation below. -->
<LinePlot
	width={720}
	height={340}
	data={REGION_VALUES}
	x="date"
	y="value"
	facet={{ by: 'region', columns: 3, mode: 'carousel', visible: 2, navLayout: 'below' }}
/>
