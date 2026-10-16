<script lang="ts">
	import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
	import GeoPlot from '$lib/plots/geo/Plot.svelte';
	import { argentinaBicontinental } from '$lib/layout/coordinates/projections/argentina';
	import { HEAT_CELLS } from '../../../data/heat-cells';
	import { ARGENTINA_PROVINCES } from '../../../plots/geo/data';
	import { provincePopulation } from '../../../plots/geo/channels';
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
		data={HEAT_CELLS.filter((d) => d.scenario === 'Baseline' && d.year === 2022)}
		x="rooms"
		y="people"
		color="pct"
		opacity="people"
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
