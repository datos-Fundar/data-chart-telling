<script lang="ts">
	import AreaPlot from '$lib/plots/evolution/area/Plot.svelte';
	import { HEIGHT_DENSITY } from '$datasets';
</script>

<!-- The automatic legend keeps `male` and `female`; `items` adds one more at the end. -->
<AreaPlot
	width={760}
	height={360}
	data={HEIGHT_DENSITY}
	x="height"
	y="density"
	color="sex"
	segments={{ female: [{ areas: [{ x: { from: 155 } }], styles: { fill: '#f6c26b' } }] }}
	legend={{ items: [{ name: 'female-tall', label: 'female > 155 cm', color: '#f6c26b' }] }}
/>
