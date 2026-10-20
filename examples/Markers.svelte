<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { LIFE } from './data';
</script>

<!-- Markers add marks to a plot: a hover highlight, a reference rule and a delta between two series. -->
<LinePlot
	width={720}
	height={400}
	data={LIFE}
	x="year"
	y="value"
	color="sex"
	scales={{ x: { edgeTicks: true } }}
	markers={[
		{ type: 'hover' },
		{ type: 'rule', axis: 'x', value: 2001, styles: { stroke: '#999', strokeDasharray: '4 4' } },
		{
			type: 'delta',
			axis: 'x',
			at: 1980,
			from: { type: 'series', series: 'female' },
			to: { type: 'series', series: 'male' },
			formatDiff: (difference) => difference.toFixed(1)
		}
	]}
/>
