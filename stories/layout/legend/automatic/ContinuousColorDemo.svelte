<script lang="ts">
	import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
	import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
	import { argentinaBicontinental } from '$lib/layout/coordinates/projections/argentina';
	import { PENGUIN_COUNTS } from '$datasets';
	import { ARGENTINA_PROVINCES } from '$datasets/argentina-provinces';
	import { provincePopulation } from '../../../plots/map/geo/channels';
</script>

<!--
	`color` and `opacity` each add a continuous section. The map's `color` is a
	named function, so its legend is titled "Province population".
-->
<div style="display: flex; flex-direction: column; gap: 24px;">
	<HeatmapPlot
		width={760}
		height={320}
		title="Color and opacity"
		data={PENGUIN_COUNTS}
		x="island"
		y="species"
		color="count"
		opacity="speciesTotal"
		scales={{ color: { scheme: 'warm' } }}
	/>
	<GeoPlot
		width={760}
		height={420}
		title="A named color function"
		data={ARGENTINA_PROVINCES}
		color={provincePopulation}
		scales={{ color: { scheme: 'blues' } }}
		coordinates={{ projection: { type: argentinaBicontinental } }}
	/>
</div>
