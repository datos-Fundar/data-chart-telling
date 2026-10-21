<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { LIFE } from './datasets';
</script>

<!-- A segment sets its own curve: the female line is straight until 1980 and steps from then on. -->
<LinePlot
	width={720}
	height={380}
	data={LIFE}
	x="year"
	y="value"
	color="sex"
	scales={{ x: { edgeTicks: true } }}
	segments={{
		female: [{ areas: [{ x: { from: 1980 } }], styles: { curve: 'step-after' } }]
	}}
/>
