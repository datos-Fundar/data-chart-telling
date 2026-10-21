<script lang="ts">
	import { BarPlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES, MONTHS } from './datasets';
</script>

<!-- Categories on x, values on y. Swap `x` and `y` for horizontal bars. -->
<BarPlot
	width={720}
	height={400}
	data={REGION_VALUES.filter((row) => row.date === MONTHS.at(-1))}
	x="region"
	y="value"
	styles={{ values: { show: true, anchor: 'outside' } }}
/>
