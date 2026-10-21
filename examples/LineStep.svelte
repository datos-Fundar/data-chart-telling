<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { LIFE } from './data';
</script>

<!-- A step plot is a line plot with a step curve: each life table holds its value until the next one. -->
<LinePlot
	width={720}
	height={380}
	data={LIFE}
	x="year"
	y="value"
	color="sex"
	scales={{ x: { edgeTicks: true } }}
	styles={{ curve: 'step-after' }}
/>
