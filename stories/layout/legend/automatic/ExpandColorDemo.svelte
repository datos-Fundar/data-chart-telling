<script lang="ts">
	import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
	import { HEAT_CELLS } from '../../../data/heat-cells';
</script>

<!--
	`color` adjusts the automatic continuous section of the color ramp: here it
	turns it interactive - drag its handles to dim the cells outside a range -
	and widens it. The ramp's colors and range still come from the plot.
-->
<HeatmapPlot
	width={760}
	height={420}
	data={HEAT_CELLS.filter((d) => d.scenario === 'Baseline' && d.year === 2022)}
	x="rooms"
	y="people"
	color="pct"
	legend={{ color: { title: 'Share of homes', width: 260, interactive: { enabled: true } } }}
	styles={{ values: { format: (v: number) => `${(v * 100).toFixed(0)}%` } }}
/>
