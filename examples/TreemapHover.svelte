<script lang="ts">
	import { TreemapPlot } from '@fundar/data-chart-telling';
	import { ACTIVITY_BRANCHES } from './datasets';
</script>

<!--
	The hover marker restyles the tiles themselves: the hovered one at full strength and outlined, every other
	faded. Each label is still written on its tile, in the color that reads best on it.
-->
<TreemapPlot
	width={760}
	height={440}
	data={ACTIVITY_BRANCHES}
	value="value"
	grouping="sector.branch"
	styles={{ area: { fillOpacity: 0.85 } }}
	tooltip
	markers={[
		{
			type: 'hover',
			active: { fillOpacity: 1, stroke: '#111827', strokeWidth: 2 },
			others: { fillOpacity: 0.35 }
		}
	]}
/>
