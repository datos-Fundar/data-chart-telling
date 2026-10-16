<script lang="ts">
	import { BarPlot } from '@fundar/data-chart-telling';
	import { ROWS } from './data';
</script>

<!-- Categories on x, values on y. Swap `x` and `y` for horizontal bars. -->
<BarPlot
	width={720}
	height={400}
	data={ROWS.filter((d) => d.year === 2023)}
	x="region"
	y="value"
	styles={{ values: { show: true, anchor: 'outside' } }}
/>
