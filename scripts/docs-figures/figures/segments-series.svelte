<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { LIFE } from '../data';
</script>

<LinePlot
	width={720}
	height={380}
	data={LIFE}
	x="year"
	y="value"
	color="sex"
	segments={{
		female: [{ styles: { stroke: { stroke: 'steelblue' } } }],
		male: [{ styles: { stroke: { stroke: 'tomato' } } }],
		default: [
			{
				areas: [{ x: { from: 2010, to: 2012 } }],
				styles: { dots: { dotRadius: 5, dotSymbol: 'circle' } }
			}
		]
	}}
/>
