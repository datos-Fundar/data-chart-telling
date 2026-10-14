<script lang="ts">
	import AreaPlot from '$lib/plots/area/Plot.svelte';
	import { HEIGHT_DENSITY } from '../../../data/height-density';
</script>

<!-- The automatic legend keeps `male` and `female`; `items` adds one more at the end. -->
<AreaPlot
	width={760}
	height={360}
	data={HEIGHT_DENSITY}
	x="height"
	y="density"
	color="sex"
	segments={{ female: [{ areas: [{ x: { from: 165 } }], styles: { fill: '#f6c26b' } }] }}
	legend={{ items: [{ name: 'female-tall', label: 'female > 165 cm', color: '#f6c26b' }] }}
/>
