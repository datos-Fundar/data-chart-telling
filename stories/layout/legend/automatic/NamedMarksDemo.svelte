<script lang="ts">
	import AreaPlot from '$lib/plots/evolution/area/Plot.svelte';
	import { HEIGHT_DENSITY } from '$datasets';
</script>

<!--
	The segment and the marker name themselves with `legend`: a label alone takes
	the color and mark they draw with; an item sets its own label, color, symbol
	or line style.
-->
<AreaPlot
	width={760}
	height={360}
	data={HEIGHT_DENSITY}
	x="height"
	y="density"
	color="sex"
	segments={{
		female: [
			{ areas: [{ x: { from: 155 } }], styles: { fill: '#f6c26b' }, legend: 'female > 155 cm' }
		]
	}}
	markers={[
		{
			type: 'rule',
			axis: 'x',
			value: 155,
			styles: { stroke: '#64748b', strokeDasharray: '4 3' },
			legend: { label: '155 cm threshold', lineStyle: 'dashed' }
		}
	]}
/>
