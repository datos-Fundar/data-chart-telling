<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { LIFE } from '../data';
</script>

<LinePlot
	width={720}
	height={400}
	data={LIFE}
	x="year"
	y="value"
	color="sex"
	markers={[
		{ type: 'hover' },
		{ type: 'rule', axis: 'x', value: 2020, styles: { stroke: '#999', strokeDasharray: '4 4' } },
		{
			type: 'delta',
			axis: 'x',
			at: 2018,
			from: { type: 'series', series: 'female' },
			to: { type: 'series', series: 'male' },
			formatDiff: (d) => d.toFixed(1)
		}
	]}
/>
