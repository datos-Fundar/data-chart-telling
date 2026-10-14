<script lang="ts">
	import AreaPlot from '$lib/plots/area/Plot.svelte';
	import { HEIGHT_DENSITY } from '../../../data/height-density';
</script>

<!-- `sections` adds whole sections after the automatic ones - here, a titled note. -->
<AreaPlot
	width={760}
	height={360}
	data={HEIGHT_DENSITY}
	x="height"
	y="density"
	color="sex"
	legend={{
		sections: [
			{
				type: 'discrete',
				title: 'Source',
				items: [{ name: 'illustrative', label: 'Illustrative normal curves', symbol: 'square' }]
			}
		]
	}}
/>
