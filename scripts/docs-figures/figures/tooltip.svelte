<script module lang="ts">
	export const meta = { hover: { x: 330, y: 160 } };
</script>

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
	tooltip
	markers={[{ type: 'hover' }]}
/>
